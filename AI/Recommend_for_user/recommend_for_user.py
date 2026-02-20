import pandas as pd
import mysql.connector
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Hàm lấy dữ liệu sản phẩm từ database
def fetch_products_from_db():
    conn = mysql.connector.connect(
        host="localhost", user="root", password="", database="btl_tmdt"
    )
    cursor = conn.cursor(dictionary=True)
    query = """
    SELECT 
        p.id AS product_id,
        p.name,
        p.price,
        p.images,
        c.name AS category_name
    FROM product p
    LEFT JOIN category c ON p.categoryId = c.id;
    """
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Hàm lấy hành vi người dùng (lượt xem, thích)
def fetch_user_behavior(user_id):
    conn = mysql.connector.connect(
        host="localhost", user="root", password="", database="btl_tmdt"
    )
    cursor = conn.cursor(dictionary=True)
    query = """
    SELECT productId AS product_id, viewCount, isLiked
    FROM userBehavior
    WHERE userId = %s;
    """
    cursor.execute(query, (user_id,))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Hàm lấy sản phẩm trong giỏ hàng
def fetch_user_cart(user_id):
    conn = mysql.connector.connect(
        host="localhost", user="root", password="", database="btl_tmdt"
    )
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT DISTINCT ps.productId AS product_id
    FROM cart c
    JOIN cartProductSize cps ON c.id = cps.cartId
    JOIN productSize ps ON cps.productSizeId = ps.id
    WHERE c.userId = %s;
    """
    
    cursor.execute(query, (user_id,))
    results = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [item['product_id'] for item in results]


# Hàm lấy lịch sử mua hàng
def fetch_user_purchase_history(user_id):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="btl_tmdt"
    )
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT DISTINCT od.productId AS product_id
    FROM orders o
    JOIN ordersDetails od ON o.id = od.orderId
    WHERE o.userId = %s;
    """
    
    cursor.execute(query, (user_id,))
    results = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return [item['product_id'] for item in results]

# Hàm xử lý dữ liệu sản phẩm

def process_product_data(raw_data):
    df = pd.DataFrame(raw_data)
    
    # Gom nhóm nếu cần thiết, nhưng giữ lại category_name & images
    df = df.groupby(['product_id', 'name', 'price', 'images', 'category_name']).size().reset_index(name='count')
    
    # Tạo cột text để vector hóa
    df['text'] = (
        df['name'].fillna('') + ' ' +
        df['category_name'].fillna('')
    )

    # Giữ lại đầy đủ cột cho bước recommend
    df = df[['product_id', 'name', 'price', 'images', 'category_name', 'text']]
    return df


# Hàm gợi ý sản phẩm
def goi_y_san_pham_cho_nguoi_dung(user_id, num_recommendations=10):
    raw_data = fetch_products_from_db()
    df = process_product_data(raw_data)

    behavior_data = fetch_user_behavior(user_id)
    cart_product_ids = fetch_user_cart(user_id)
    purchase_product_ids = fetch_user_purchase_history(user_id)

    interacted_products = {}
    for item in behavior_data:
        product_id = item['product_id']
        score = item['viewCount'] * 1 + item['isLiked'] * 5
        interacted_products[product_id] = interacted_products.get(product_id, 0) + score

    for product_id in cart_product_ids:
        interacted_products[product_id] = interacted_products.get(product_id, 0) + 10
    for product_id in purchase_product_ids:
        interacted_products[product_id] = interacted_products.get(product_id, 0) + 15

    interacted_product_ids = list(interacted_products.keys())

    if not interacted_product_ids:
        recommended_products = df.sample(n=min(num_recommendations, len(df)))[
            ['product_id', 'name', 'price', 'images', 'category_name']
        ]
        return recommended_products.to_dict(orient='records')

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['text'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    recommended_scores = {}
    for product_id, behavior_score in interacted_products.items():
        if product_id in df['product_id'].values:
            idx = df.index[df['product_id'] == product_id].tolist()[0]
            sim_scores = list(enumerate(cosine_sim[idx]))
            for i, sim_score in sim_scores:
                if df['product_id'][i] not in interacted_product_ids:
                    recommended_scores[df['product_id'][i]] = (
                        recommended_scores.get(df['product_id'][i], 0) + sim_score * behavior_score
                    )

    recommended_ids = [
        pid for pid, _ in sorted(recommended_scores.items(), key=lambda x: x[1], reverse=True)[:num_recommendations]
    ]

    recommended_products = df[df['product_id'].isin(recommended_ids)][
        ['product_id', 'name', 'price', 'images', 'category_name']
    ]

    if len(recommended_products) < num_recommendations:
        remaining = num_recommendations - len(recommended_products)
        available_ids = set(df['product_id']) - set(interacted_product_ids) - set(recommended_ids)
        if available_ids:
            additional_ids = np.random.choice(list(available_ids), size=min(remaining, len(available_ids)), replace=False)
            additional_products = df[df['product_id'].isin(additional_ids)][
                ['product_id', 'name', 'price', 'images', 'category_name']
            ]
            recommended_products = pd.concat([recommended_products, additional_products], ignore_index=True)

    return recommended_products.to_dict(orient='records')


# Ví dụ: Gợi ý cho user_id=1
print(goi_y_san_pham_cho_nguoi_dung(29))