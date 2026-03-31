import pika
import json
import time
from textblob import TextBlob
import sys

RABBITMQ_HOST = 'localhost'
QUEUE_REQUEST = 'transcription.request'
QUEUE_EVENTS = 'transcription.events'

def publish_event(channel, task_id, user_id, status, progress, result=None):
    event_data = {
        "taskId": task_id,
        "userId": user_id,
        "status": status,
        "progress": progress
    }
    if result is not None:
        event_data["result"] = result
        
    try:
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_EVENTS,
            body=json.dumps(event_data),
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent,
            )
        )
        print(f"Event published: Task {task_id} -> {status} ({progress})")
    except Exception as e:
        print(f"Error publishing event for Task {task_id}: {e}")

def callback(ch, method, properties, body):
    task_id = "unknown"
    user_id = "unknown"
    
    try:
        task_data = json.loads(body)
        task_id = task_data.get('taskId', 'unknown')
        user_id = task_data.get('userId', 'unknown')
        text = task_data.get('text', '')
        
        print(f"\nReceived Task {task_id}")
        
        #0%
        publish_event(ch, task_id, user_id, 'PROCESSING', 0)
        time.sleep(1)

        if not text or not text.strip():
            print(f"Found Task {task_id} with empty text.")
            result = {"error": "Text is empty. Cannot perform Data Science analysis."}
            publish_event(ch, task_id, user_id, 'ERROR', 0, result)
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        print(f"Processing NLP for Task {task_id}...")

        blob = TextBlob(text)
        
        #30%
        publish_event(ch, task_id, user_id, 'PROCESSING', 30)
        word_count = len(blob.words)
        sentences_count = len(blob.sentences)
        time.sleep(2)
        
        #60%
        publish_event(ch, task_id, user_id, 'PROCESSING', 60)
        sentiment = blob.sentiment
        polarity = round(sentiment.polarity, 2)
        subjectivity = round(sentiment.subjectivity, 2)
        time.sleep(2)
        
        #90%
        publish_event(ch, task_id, user_id, 'PROCESSING', 90)
        noun_phrases = list(set(blob.noun_phrases))[:15]
        time.sleep(1)
        
        result = {
            "analysis_type": "NLP & Sentiment Pipeline",
            "metrics": {
                "word_count": word_count,
                "sentences_count": sentences_count
            },
            "sentiment": {
                "polarity": polarity,
                "subjectivity": subjectivity
            },
            "keywords": noun_phrases
        }
        
        #100%
        publish_event(ch, task_id, user_id, 'DONE', 100, result)
        print(f"Task {task_id} successfully completed.")
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"Critical error while executing Task {task_id}: {str(e)}")
        if task_id != "unknown":
            error_details = {"error_message": str(e)}
            publish_event(ch, task_id, user_id, 'ERROR', 0, error_details)
            
        ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()

        channel.queue_declare(queue=QUEUE_REQUEST, durable=True)
        channel.queue_declare(queue=QUEUE_EVENTS, durable=True)

        print(f"Python Data Science Worker started.")
        print(f"Waiting for messages in {QUEUE_REQUEST}. To exit press CTRL+C")

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE_REQUEST, on_message_callback=callback)

        channel.start_consuming()
    except pika.exceptions.AMQPConnectionError:
        print(f"Unable to connect to RabbitMQ on {RABBITMQ_HOST}. Is the server running?")
        sys.exit(1)
    except KeyboardInterrupt:
        print("Worker stopped by user.")
        sys.exit(0)

if __name__ == '__main__':
    main()
