CREATE TABLE subscribers (
    id SERIAL PRIMARY KEY,
    subscriber_no VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    subscriber_id INT NOT NULL REFERENCES subscribers(id),
    month VARCHAR(7) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0
);


ALTER TABLE bills
ADD COLUMN is_paid BOOLEAN GENERATED ALWAYS AS (paid_amount >= total_amount) STORED;

CREATE TABLE bill_details (
    id SERIAL PRIMARY KEY,
    bill_id INT NOT NULL REFERENCES bills(id),
    description TEXT,
    amount NUMERIC(10,2) NOT NULL
);
