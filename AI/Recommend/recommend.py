import pandas as pd
import mysql.connector
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Hàm lấy dữ liệu từ database (đã cung cấp)
def fetch_products_from_db():
    conn = mysql.connector.connect(
        host="localhost", user="root", password="", database="btl_tmdt"
    )
    cursor = conn.cursor(dictionary=True)
    query = """
    SELECT 
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        p.images,
        c.name AS category_name,
        s.name AS size_name,
        ps.stock
    FROM product p
    LEFT JOIN category c ON p.categoryId = c.id
    LEFT JOIN productSize ps ON p.id = ps.productId 
    LEFT JOIN size s ON ps.sizeId = s.id;
    """
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Hàm xử lý dữ liệu để gộp sản phẩm (loại bỏ trùng lặp product_id)
def process_product_data(raw_data):
    df = pd.DataFrame(raw_data)
    # Gộp các kích cỡ và stock cho mỗi sản phẩm
    df = (
        df.groupby(['product_id', 'name', 'price', 'images', 'category_name'])
        .agg({
            'size_name': lambda x: ', '.join(set(x.dropna())),
            'stock': 'sum'
        })
        .reset_index()
    )
    # Tạo cột 'text' chỉ dựa trên category_name
    df['text'] = df['category_name'].fillna('').str.lower()
    
    return df

# Hàm gợi ý sản phẩm
def goi_y_san_pham(product_id, num_recommendations=10):
    raw_data = fetch_products_from_db()
    df = process_product_data(raw_data)
    
    if product_id not in df['product_id'].values:
        return {"error": f"Không tìm thấy sản phẩm với ID {product_id}"}
    
    # Vector hóa
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['text'])
    
    # Ma trận tương đồng
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    # Index sản phẩm hiện tại
    idx = df.index[df['product_id'] == product_id].tolist()[0]
    
    # Tính điểm tương đồng
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Lấy top 10 (bỏ chính sản phẩm đó)
    sim_scores = [s for s in sim_scores if s[0] != idx][:num_recommendations]
    
    # Lấy danh sách sản phẩm tương tự
    recommended_ids = [df.iloc[i]['product_id'] for i, _ in sim_scores]
    recommended_products = df[df['product_id'].isin(recommended_ids)][
        ['product_id', 'name', 'price', 'images']
    ]
    
    return recommended_products.to_dict(orient='records')


# # Ví dụ: Gợi ý 5 sản phẩm cho sản phẩm có product_id=1
#print(goi_y_san_pham(14))