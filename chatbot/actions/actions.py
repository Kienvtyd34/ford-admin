from rasa_sdk import Action
import requests

class ActionGetCarPrice(Action):
    def name(self):
        return "action_get_car_price"

    def run(self, dispatcher, tracker, domain):

        # 👉 lấy full câu user
        user_message = tracker.latest_message.get("text")

        res = requests.get(
            "https://ford-admin.onrender.com/api/ai-chat/price",
            params={"name": user_message}
        )

        data = res.json()

        if "variants" in data:
            msg = f"Giá xe {data['model']}:\n"
            for v in data["variants"]:
                msg += f"- {v['variant']}: {v['price']:,} VND\n"
        else:
            msg = data.get("message", "Không tìm thấy xe")

        dispatcher.utter_message(text=msg)
        return []