from locust import HttpUser, task, between
import string
import random

def random_string(length):
    return ''.join(random.choices(string.ascii_letters, k=length))

class WebAppUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        username = random_string(10)
        response = self.client.post("/login", json={"username": username})
        if response.status_code == 200:
            token = response.json().get("token")
            self.client.headers.update({"Authorization": f"Bearer {token}"})

    @task(3)
    def create_task(self):
        text = random_string(20)
        self.client.post("/tasks", json={"text": text}, name="Create Task")

    @task(1)
    def get_tasks(self):
        self.client.get("/tasks", name="Get All Tasks")
