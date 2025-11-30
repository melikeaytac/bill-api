# Billing API – SE4458 Midterm Project

## 1. Overview

This project implements a fully functional **cloud-native Billing API** based on the SE4458 Midterm specification. It provides endpoints for Mobile App, Banking App, Web Client, and Admin Portal. The system runs on **Azure App Service**, uses **Azure API Management (APIM)** as gateway, and stores data in **Azure PostgreSQL**.

### Key Features

* Versioned REST API (`/api/v1/...`)
* JWT authentication (Mobile, Bank, Admin)
* API Gateway rate-limiting (**3 calls/day per subscriber**)
* Web Pay endpoint (no authentication)
* Batch Bill creation (CSV upload)
* Detailed bill queries with paging
* Centralized backend request logging
* Swagger / OpenAPI documentation
* Azure-native deployment

---

## 2. Architecture

```
[ Clients ]
  • Mobile App
  • Banking App
  • Web Client (Pay Bill)
  • Admin Panel
           |
           v
[ Azure API Management Gateway ]
  • 3/day rate limit (quota-by-key)
  • Routing to backend
           |
           v
[ Azure App Service – Node.js Backend ]
  • Express.js API
  • JWT auth
  • CSV batch processor
  • Logging middleware
           |
           v
[ Azure PostgreSQL Flexible Server ]
  • subscribers
  • bills
  • bill_details
  • request_logs
```

---

## 3. Entity-Relationship Diagram

```
![ER Diagram](./ERdiagram.png)
```

### Database Schema Summary

#### SUBSCRIBERS

| Field         | Type     | Note   |
| ------------- | -------- | ------ |
| id            | int      | PK     |
| subscriber_no | string   | unique |
| created_at    | datetime |        |

#### BILLS

| Field         | Type    | Note                 |
| ------------- | ------- | -------------------- |
| id            | int     | PK                   |
| subscriber_id | int     | FK → subscribers(id) |
| month         | string  | YYYY-MM format       |
| total_amount  | decimal |                      |
| paid_amount   | decimal |                      |

#### BILL_DETAILS

| Field       | Type    | Note           |
| ----------- | ------- | -------------- |
| id          | int     | PK             |
| bill_id     | int     | FK → bills(id) |
| description | string  |                |
| amount      | decimal |                |

#### REQUEST_LOGS

| Field               | Type     |
| ------------------- | -------- |
| id                  | int (PK) |
| method              | string   |
| path                | string   |
| timestamp           | datetime |
| source_ip           | string   |
| headers             | string   |
| request_size        | int      |
| auth_success        | boolean  |
| response_status     | int      |
| response_latency_ms | int      |
| response_size       | int      |

---

## 4. API Endpoints (Aligned with PDF Requirements)

### Mobile App

| Method | Endpoint                       | Description              | Auth | Notes          |
| ------ | ------------------------------ | ------------------------ | ---- | -------------- |
| GET    | `/api/v1/mobile/bill`          | Query bill summary       | ✔    | Rate-limited   |
| GET    | `/api/v1/mobile/bill/detailed` | Bill details with paging | ✔    | `page`, `size` |

### Banking App

| Method | Endpoint            | Description       | Auth |
| ------ | ------------------- | ----------------- | ---- |
| GET    | `/api/v1/bank/bill` | List unpaid bills | ✔    |

### Web Client

| Method | Endpoint          | Description | Auth |
| ------ | ----------------- | ----------- | ---- |
| POST   | `/api/v1/web/pay` | Pay a bill  | ✖    |

### Admin

| Method | Endpoint                   | Description                 | Auth |
| ------ | -------------------------- | --------------------------- | ---- |
| POST   | `/api/v1/admin/bill`       | Create a bill               | ✔    |
| POST   | `/api/v1/admin/bill/batch` | Batch billing (CSV or JSON) | ✔    |

---

## 5. CSV Batch Format

Example CSV:

```csv
SubscriberNo,Month,TotalAmount,PaidAmount
101,2025-10,250.5,0
102,2025-11,300,100
103,2025-12,150,0
```

---

## 6. Rate Limiting (API Gateway)

The system enforces **3 bill queries per subscriber per day**, as required.

APIM policy:

```xml
<quota-by-key calls="3"
              renewal-period="86400"
              counter-key="@(context.Request.Url.Query.GetValueOrDefault("subscriberNo","default"))" />
```

Behavior:

* 4th call → `403 Out of call volume quota`
* backend is not executed
* request_logs does not record APIM-blocked requests

---

## 7. Logging

Every backend-handled request is logged in `request_logs` table.
Captured fields:

* method
* path
* source_ip
* headers
* request_size
* auth_success
* response_status
* response_latency_ms
* response_size

---

## 8. Deployment

### Azure App Service

* Node.js backend
* environment variables: `DATABASE_URL`, `JWT_SECRET`

### Azure API Management

* gateway routing
* quota enforcement
* subscription disabled

### Azure PostgreSQL

* Flexible Server
* SSL enabled

### CI/CD

* GitHub Actions with OIDC
* automatic deployment to App Service

---

## 9. Swagger Documentation

Swagger UI:

```
https://bill-api-app-12345.azurewebsites.net/docs
```

Includes:

* all endpoints
* schemas
* examples
* JWT bearerAuth
* multiple server entries (App Service + APIM)

---

## 10. Health Check

```
https://bill-api-app-12345.azurewebsites.net/health
```
---

## 11. Summary

* Complete endpoint coverage
* JWT auth
* APIM rate limiting
* CSV batch ingestion
* Payment accuracy
* Cloud deployment
* Backend logging
* Swagger documentation
* Architecture + ER models

System is fully compliant and production-ready.

---


## 12. Live Demo

```
https://1drv.ms/v/c/b335192371edde15/IQAjL71RKpGiRqe7oiQLj3u7AeMP7D8Xf-cVyKQO44DBfuk?e=A0ib4z
```
