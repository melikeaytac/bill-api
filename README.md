# Billing Agent

**Billing Agent** is a microservice-based application that enables users to query billing information using natural language.

---

## Architecture

The system consists of four deployed services:

* **Frontend** – User interface
* **Gateway** – Request entry point
* **Orchestrator** – Intent analysis and flow control
* **Billing Backend API** – Billing data provider

Conversation data is persisted using **Firebase Firestore**.

All services are deployed on **Vercel** and communicate via HTTPS.

---

## Live Demo

* **Demo Video**
  [https://1drv.ms/v/c/b335192371edde15/IQA0swTqZfunTLSWGOJpQc6KAd_xtpywruP7JhSSAdLytVc?e=WXFoRW](https://1drv.ms/v/c/b335192371edde15/IQA0swTqZfunTLSWGOJpQc6KAd_xtpywruP7JhSSAdLytVc?e=WXFoRW)

---

## Live Deployment Links

* **Frontend**
  [https://bill-api-frontend.vercel.app](https://bill-api-frontend.vercel.app)

* **Gateway**
  [https://bill-api-three.vercel.app](https://bill-api-three.vercel.app)

* **Orchestrator**
  [https://bill-api-orch.vercel.app](https://bill-api-orch.vercel.app)

* **Billing Backend API**
  [https://bill-api-backend.vercel.app/api/v1](https://bill-api-backend.vercel.app/api/v1)

---

## Request Flow

1. User submits a natural language query.
2. The request is sent to the Gateway.
3. The Gateway forwards the request to the Orchestrator.
4. The Orchestrator:

   * Uses **Gemini (Google AI Studio)** for intent analysis
   * Calls the Billing Backend API when required
5. The response is returned to the user.
6. Messages are stored in **Firebase Firestore**.

---

## Technologies

* **LLM**: Gemini (Google AI Studio)
* **Backend**: Node.js (microservices)
* **Database**: Firebase Firestore
* **Deployment**: Vercel

---

## Key Points

* Natural language billing queries
* Real backend API integration
* Persistent conversation storage
* No localhost usage in production
* Secure configuration via environment variables
