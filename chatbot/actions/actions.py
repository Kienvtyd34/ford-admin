from rasa_sdk import Action
import requests

class ActionGetCarPrice(Action):
    def name(self):
        return "action_get_car_price"

    def run(self, dispatcher, tracker, domain):
        car_name = tracker.get_slot("car_name")

        res = requests.get(
            f"https://ford-admin.onrender.com/api/ai-chat/price?name={car_name}"
        )

        data = res.json()

        if "variants" in data:
            msg = f"Giá xe {data['model']}:\n"
            for v in data["variants"]:
                msg += f"- {v['variant']}: {v['price']:,} VND\n"
        else:
            msg = "Không tìm thấy xe"

        dispatcher.utter_message(text=msg)
        return []