from flask import Flask, jsonify, request
from ChatBot.test_bot import get_chatbot_reply   # import đúng module chatbot
from Recommend.recommend import goi_y_san_pham  # import hàm gợi ý sản phẩm
from Recommend_for_user.recommend_for_user import goi_y_san_pham_cho_nguoi_dung

app = Flask(__name__)

@app.route('/recommend/<int:product_id>')
def recommend(product_id):
    recommendations = goi_y_san_pham(product_id)
    return jsonify(recommendations)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()
        
        if not user_message:
            return jsonify({"error": "Thiếu nội dung tin nhắn"}), 400

        # Gọi Gemini (hàm get_chatbot_reply của bạn)
        result = get_chatbot_reply(user_message)

        # Đảm bảo luôn trả về đúng format dù Gemini có lỗi gì
        reply_text = result.get("reply", "Dạ em xin lỗi, shop đang bận chút xíu ạ!")
        products = result.get("data", [])  # danh sách sản phẩm (có thể rỗng)

        # Trả về JSON chuẩn cho frontend
        return jsonify({
            "reply": reply_text,
            "products": products   # ← frontend chỉ cần loop cái này là ra ảnh, giá, tên, id...
        })

    except Exception as e:
        return jsonify({
            "reply": "Shop đang gặp lỗi kỹ thuật, bạn thử lại sau vài phút nha!",
            "products": []
        }), 500


@app.route("/recommend-product-for-user", methods=["GET"])
def recommend_product_for_user():
    print("Hello")
    user_id = request.args.get("userId", type=int)
    num = request.args.get("num", default=10, type=int)
    print(user_id)
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    try:
        recommended_products = goi_y_san_pham_cho_nguoi_dung(user_id, num)
        return jsonify({
            "user_id": user_id,
            "recommendations": recommended_products
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 
    

if __name__ == '__main__':
    app.run(debug=True)