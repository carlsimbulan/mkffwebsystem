CREATE DATABASE IF NOT EXISTS mkff;
USE mkff;



CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `daily_reports` (
  `id` int(11) NOT NULL,
  `station` varchar(50) NOT NULL,
  `report_date` date NOT NULL,
  `shift` varchar(20) NOT NULL,
  `total_units_processed` int(11) DEFAULT 0,
  `total_ng` int(11) DEFAULT 0,
  `downtime_minutes` int(11) DEFAULT 0,
  `summary` text DEFAULT NULL,
  `attachment_filename` varchar(255) DEFAULT NULL,
  `submitted_by` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `units` (
  `id` int(11) NOT NULL,
  `model` varchar(100) NOT NULL,
  `revision` varchar(50) DEFAULT NULL,
  `base_unit_kitting_no` varchar(100) DEFAULT NULL,
  `assembly_no` varchar(100) DEFAULT NULL,
  `device_serial_no` varchar(100) DEFAULT NULL,
  `accessory_kitting_no` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'In Progress',
  `remarks` text DEFAULT NULL,
  `station` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `unit_history` (
  `history_id` int(11) NOT NULL,
  `unit_id` int(11) NOT NULL,
  `model` varchar(255) DEFAULT NULL,
  `assembly_no` varchar(255) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `station_name` varchar(50) NOT NULL,
  `status_after` varchar(50) NOT NULL,
  `remarks` text DEFAULT NULL,
  `action_by` varchar(100) DEFAULT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `station` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;