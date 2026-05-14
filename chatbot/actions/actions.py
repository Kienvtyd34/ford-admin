from rasa_sdk import Action
from rasa_sdk.events import SlotSet
import requests

BASE_URL = "https://ford-admin.onrender.com/api/ai-chat"

# =========================
# 1. LẤY GIÁ XE (CÓ NHỚ NGỮ CẢNH)
# =========================
class ActionGetCarPrice(Action):

    def name(self):
        return "action_get_car_price"

    def run(self, dispatcher, tracker, domain):

        user_message = tracker.latest_message.get("text")
        car_name = tracker.get_slot("car_name")

        # 👉 nếu user chỉ hỏi "giá" → dùng xe trước đó
        if user_message.lower() in ["giá", "bao nhiêu", "giá bao nhiêu"]:
            name = car_name
        else:
            name = user_message

        if not name:
            dispatcher.utter_message(text="Bạn muốn hỏi giá xe nào?")
            return []

        try:
            res = requests.get(
                f"{BASE_URL}/price",
                params={"name": name}
            )

            data = res.json()

            if "variants" in data:
                msg = f"🚗 Giá xe {data['model']}:\n"
                for v in data["variants"]:
                    msg += f"- {v['variant']}: {v['price']:,} VND\n"

                msg += "\n👉 Bạn muốn xem chi tiết hay lái thử xe không?"

                dispatcher.utter_message(text=msg)

                return [SlotSet("car_name", data["model"])]

            else:
                dispatcher.utter_message(
                    text=data.get("message", "Không tìm thấy xe")
                )

        except Exception as e:
            dispatcher.utter_message(text="❌ Lỗi kết nối server")

        return []


# =========================
# 2. GỢI Ý XE (AI SHOWROOM)
# =========================
class ActionRecommendCar(Action):

    def name(self):
        return "action_recommend_car"

    def run(self, dispatcher, tracker, domain):

        user_message = tracker.latest_message.get("text")

        # 👉 detect budget đơn giản
        budget = None
        if "1 tỷ 5" in user_message or "1.5" in user_message:
            budget = 1500000000
        elif "1 tỷ" in user_message:
            budget = 1000000000
        elif "500" in user_message:
            budget = 500000000

        try:
            res = requests.get(f"{BASE_URL}/recommend")
            data = res.json()

            if not data:
                dispatcher.utter_message(text="❌ Không tìm thấy xe phù hợp")
                return []

            msg = "🚗 Gợi ý xe phù hợp:\n"

            for car in data:
                msg += f"- {car['name']} ({car['type']}, {car['seats']} chỗ)\n"

            msg += "\n👉 Bạn muốn xem giá xe nào?"

            dispatcher.utter_message(text=msg)

        except:
            dispatcher.utter_message(text="❌ Lỗi server")

        return []