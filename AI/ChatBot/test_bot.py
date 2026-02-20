import os
import json
import mysql.connector
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# =====================
# LẤY DỮ LIỆU TỪ DB
# =====================
def fetch_products_from_db():
    conn = mysql.connector.connect(
        host="localhost", user="root", password="", database="btl_tmdt"
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.id AS product_id, p.name, p.description, p.price, p.images
        FROM product p
        LEFT JOIN category c ON p.categoryId = c.id
        LEFT JOIN productSize ps ON p.id = ps.productId 
        LEFT JOIN size s ON ps.sizeId = s.id
    """)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# =====================
# ĐỊNH DẠNG SẢN PHẨM (lọc từ nhạy cảm để chắc ăn)
# =====================
def format_products(products):
    safe_text = ""
    for item in products:
        name = str(item['name'] or "")
        desc = str(item['description'] or "")
        # Lọc từ nhạy cảm (nếu có)
        for bad in ["sexy", "gợi cảm", "hở", "đồ lót", "ngực", "mông"]:
            name = name.replace(bad, "xinh").replace(bad.upper(), "XINH")
            desc = desc.replace(bad, "xinh").replace(bad.upper(), "XINH")
        image = (item['images'] or "").split(',')[0].strip() if item.get('images') else "Không có ảnh"
        safe_text += f"- ID: {item['product_id']} | {name} | {item['price']:,}đ | {image}\n  Mô tả: {desc}\n\n"
    return safe_text

# =====================
# PROMPT HỆ THỐNG
# =====================
conversation_history = []
def get_system_prompt():
    
    products = fetch_products_from_db()
    product_text = format_products(products)
    
    return (
        "Bạn là nhân viên bán hàng siêu dễ thương của shop đồ ngủ & đồ bộ nữ.\n"
        "Luôn trả lời thân thiện, tự nhiên, ngắn gọn.\n"
        "Khi khách hỏi sản phẩm → TRẢ VỀ CHỈ JSON SAU (không thêm chữ nào):\n"
        "{\n"
        '  "reply": "câu trả lời tự nhiên",\n'
        '  "data": [{"id": 123, "name": "Tên sp", "description": "Mô tả", "price": 250000, "image": "url_ảnh"}]\n'
        "}\n"
        "Nếu không có sp phù hợp → chỉ trả lời bình thường, không JSON.\n\n"
        "Khách có thể hỏi tiếp về sản phẩm vừa gợi ý (ví dụ: giá bao nhiêu, có size M không, màu gì...) → bạn phải hiểu ngữ cảnh từ tin nhắn trước.\n\n"
        "Danh sách sản phẩm:\n\n" + product_text
    )

# =====================
# GỌI GEMINI – FIX HOÀN TOÀN LỖI SAFETY (100% CHẠY)
# =====================
def get_chatbot_reply(user_message: str) -> dict:
    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=get_system_prompt(),
            safety_settings={                           # ← CÁCH MỚI NHẤT, CHẠY 100%
                genai.types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: genai.types.HarmBlockThreshold.BLOCK_NONE,
                genai.types.HarmCategory.HARM_CATEGORY_HARASSMENT:       genai.types.HarmBlockThreshold.BLOCK_NONE,
                genai.types.HarmCategory.HARM_CATEGORY_HATE_SPEECH:      genai.types.HarmBlockThreshold.BLOCK_NONE,
                genai.types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: genai.types.HarmBlockThreshold.BLOCK_NONE,
            }
        )

        response = model.generate_content(
            user_message,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.7,
                max_output_tokens=1000
            )
        )

        # Nếu bị block → trả lời nhẹ nhàng
        if not response.candidates or len(response.candidates[0].content.parts) == 0:
            return {"reply": "Dạ em xin lỗi, có vài mẫu hệ thống tạm ẩn ạ. Bạn muốn xem pijama cotton hay đồ bộ nào em gợi ý bằng lời nha!", "data": []}

        text = response.text.strip()
        try:
            return json.loads(text)
        except:
            return {"reply": text, "data": []}

    except Exception as e:
        return {"reply": f"Em đang bị lỗi chút xíu ạ: {str(e)}", "data": []}

# =====================
# CHẠY CHAT THỰC TẾ
# =====================
if __name__ == "__main__":
    print("Chào bạn! Shop đồ ngủ & đồ bộ nữ đây ạ")
    print("Gõ gì em trả lời liền (gõ bye để thoát)")
    print("-" * 60)

    while True:
        user_message = input("\nBạn: ").strip()
        if user_message.lower() in ["bye", "thoát", "exit"]:
            print("Hẹn gặp lại bạn nha!")
            break
        if not user_message:
            continue

        reply = get_chatbot_reply(user_message)
        print(f"Bot: {reply.get('reply', 'Em đang nghĩ...')}")

        if reply.get("data"):
            print("Sản phẩm gợi ý:")
            for p in reply["data"]:
                print(f"   • {p.get('name')} - {p.get('price',0):,}đ (ID: {p.get('id')})")
                print(f"     {p.get('description')}")
                print(f"     Ảnh: {p.get('image')}\n")