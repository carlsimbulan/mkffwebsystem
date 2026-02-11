-- Create release_pin table for shipment authorization
CREATE TABLE IF NOT EXISTS release_pin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pin VARCHAR(10) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100) DEFAULT NULL
);

-- Insert default PIN (change this after first login)
INSERT INTO release_pin (id, pin, updated_by) VALUES (1, '1234', 'System') 
ON DUPLICATE KEY UPDATE id=id;
