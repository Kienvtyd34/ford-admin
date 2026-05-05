from rasa_sdk import Action
import requests
import re

# =========================
# HELPER PARSE TEXT
# =========================
def parse_text(text):
    text = text.lower()

    max_price = None
    seats = None
    type_car = None

    # 💰 giá
    if "1 tỷ" in text:
        max_price = 1000000000
    elif "2 tỷ" in text:
        max_price = 2000000000
    elif "500 triệu" in text:
        max_price = 500000000

    # 👨‍👩‍👧‍👦 số chỗ
    match = re.search(r'(\d+)\s*chỗ', text)
    if match:
        seats = int(match.group(1))

    # 🚙 loại xe
    if "suv" in text:
        type_car = "SUV"
    elif "bán tải" in text:
        type_car = "Pick-up"
    elif "sedan" in text:
        type_car = "Sedan"

    return max_price, seats, type_car


# =========================
# ACTION GIÁ XE
# =========================
class ActionGetCarPrice(Action):
    def name(self):
        return "action_get_car_price"

    def run(self, dispatcher, tracker, domain):

        user_message = tracker.latest_message.get("text")

        try:
            res = requests.get(
                "https://ford-admin.onrender.com/api/ai-chat/price",
                params={"name": user_message},
                timeout=5
            )

            data = res.json()

            if "variants" in data:
                msg = f"Giá xe {data['model']}:\n"
                for v in data["variants"]:
                    msg += f"- {v['variant']}: {v['price']:,} VND\n"
            else:
                msg = data.get("message", "Không tìm thấy xe")

        except Exception as e:
            msg = f"Lỗi hệ thống: {str(e)}"

        dispatcher.utter_message(text=msg)
        return []


# =========================
# ACTION TƯ VẤN XE
# =========================
class ActionRecommendCar(Action):
    def name(self):
        return "action_recommend_car"

    def run(self, dispatcher, tracker, domain):

        user_message = tracker.latest_message.get("text")

        max_price, seats, type_car = parse_text(user_message)

        try:
            res = requests.get(
                "https://ford-admin.onrender.com/api/ai-chat/recommend",
                params={
                    "maxPrice": max_price,
                    "seats": seats,
                    "type": type_car
                },
                timeout=5
            )

            data = res.json()

            if isinstance(data, list) and len(data) > 0:
                msg = "Dựa trên nhu cầu của bạn, mình đề xuất:\n"
                for car in data:
                    msg += f"- {car['name']} ({car['type']}, {car.get('seats', '')} chỗ)\n"

                msg += "\nBạn muốn xem chi tiết xe nào không?"
            else:
                msg = "Hiện chưa có xe phù hợp. Bạn muốn tăng ngân sách hoặc đổi tiêu chí không?"

        except Exception as e:
            msg = f"Lỗi hệ thống: {str(e)}"

        dispatcher.utter_message(text=msg)
        return []