-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 05, 2026 at 04:18 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mkff`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `board_edit_requests`
--

CREATE TABLE `board_edit_requests` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) NOT NULL,
  `assembly_no` varchar(100) NOT NULL,
  `board_type` varchar(50) NOT NULL,
  `column_name` varchar(50) NOT NULL,
  `old_value` varchar(10) DEFAULT NULL,
  `new_value` varchar(10) NOT NULL,
  `requested_by` varchar(100) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_reports`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `station1_checklists`
--

CREATE TABLE `station1_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) NOT NULL,
  `assembly_no` varchar(100) DEFAULT NULL,
  `header_seated_90_deg` varchar(10) DEFAULT 'GO',
  `leads_properly_soldered` varchar(10) DEFAULT 'GO',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station2_checklists`
--

CREATE TABLE `station2_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `lora_module` varchar(50) DEFAULT 'Not Detected',
  `lora_mesh_test` varchar(50) DEFAULT 'Not Detected',
  `energy_meter` varchar(50) DEFAULT 'Not Detected',
  `power_good_test` varchar(50) DEFAULT 'Not Detected',
  `voltage` float DEFAULT 0,
  `line1` float DEFAULT 0,
  `line2` float DEFAULT 0,
  `line3` float DEFAULT 0,
  `temp_reading` varchar(20) DEFAULT 'FAIL',
  `freq_reading` varchar(20) DEFAULT 'NO GO',
  `led_status_4g` varchar(20) DEFAULT 'NO GO',
  `led_status_fast_blink` varchar(20) DEFAULT 'NO GO',
  `go_no_go` varchar(20) DEFAULT 'NO GO',
  `sw1_off_to_led_off_duration` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `station2_checklists`
--

INSERT INTO `station2_checklists` (`id`, `unit_id`, `assembly_no`, `lora_module`, `lora_mesh_test`, `energy_meter`, `power_good_test`, `voltage`, `line1`, `line2`, `line3`, `temp_reading`, `freq_reading`, `led_status_4g`, `led_status_fast_blink`, `go_no_go`, `sw1_off_to_led_off_duration`, `created_at`) VALUES
(1, 601, 'HIST-23-EXT-02', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 118.2, 118.2, 118.5, 118, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2023-06-12 02:15:00'),
(2, 603, 'HIST-24-EXT-02', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 119.5, 119.5, 120.1, 119.2, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2024-09-15 01:45:00'),
(3, 605, 'HIST-25-EXT-02', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 120.4, 120.4, 121, 120.2, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2025-11-30 06:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `station3_checklists`
--

CREATE TABLE `station3_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `requirements` varchar(20) DEFAULT 'Not Passed',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station4_checklists`
--

CREATE TABLE `station4_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `requirements` varchar(20) DEFAULT 'Not Passed',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station5_checklists`
--

CREATE TABLE `station5_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `requirements` varchar(20) DEFAULT 'Not Passed',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station6_checklists`
--

CREATE TABLE `station6_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(100) DEFAULT NULL,
  `lora_module` varchar(20) DEFAULT NULL,
  `lora_mesh_test` varchar(50) DEFAULT NULL,
  `energy_meter` varchar(20) DEFAULT NULL,
  `power_good_test` varchar(20) DEFAULT NULL,
  `voltage` float DEFAULT NULL,
  `line1` float DEFAULT NULL,
  `line2` float DEFAULT NULL,
  `line3` float DEFAULT NULL,
  `temp_reading` varchar(10) DEFAULT NULL,
  `freq_reading` varchar(10) DEFAULT NULL,
  `led_status_4g` varchar(20) DEFAULT NULL,
  `led_status_fast_blink` varchar(20) DEFAULT NULL,
  `go_no_go` varchar(10) DEFAULT NULL,
  `test_duration` int(11) DEFAULT NULL,
  `sw1_off_to_led_off_duration` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station7_checklists`
--

CREATE TABLE `station7_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `requirements` varchar(20) DEFAULT 'Not Passed',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station8_checklists`
--

CREATE TABLE `station8_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `power_unit_disable_lora` varchar(20) DEFAULT 'Not Passed',
  `frequency_band` varchar(20) DEFAULT 'Not Complete',
  `test_input_fields` text DEFAULT NULL,
  `rsso_testing` varchar(20) DEFAULT 'Not Passed',
  `data_outage` varchar(20) DEFAULT 'Not Passed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station9_checklists`
--

CREATE TABLE `station9_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `requirements` varchar(20) DEFAULT 'Not Passed',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station10_checklists`
--

CREATE TABLE `station10_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `requirements` varchar(20) DEFAULT 'Not Passed',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station11_checklists`
--

CREATE TABLE `station11_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `led_status` varchar(50) DEFAULT 'Not Passed',
  `low_range` varchar(20) DEFAULT 'Not Passed',
  `medium_range` varchar(20) DEFAULT 'Not Passed',
  `high_range` varchar(20) DEFAULT 'Not Passed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station12_checklists`
--

CREATE TABLE `station12_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) NOT NULL,
  `assembly_no` varchar(100) DEFAULT NULL,
  `stickers_attached` varchar(10) DEFAULT 'GO',
  `stickers_readable` varchar(10) DEFAULT 'GO',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station13_checklists`
--

CREATE TABLE `station13_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `requirements` varchar(20) DEFAULT 'Not Passed',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `station14_checklists`
--

CREATE TABLE `station14_checklists` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `requirements` varchar(20) DEFAULT 'Not Passed',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `target_times`
--

CREATE TABLE `target_times` (
  `id` int(11) NOT NULL,
  `station_id` varchar(20) NOT NULL,
  `target_minutes` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `target_times`
--

INSERT INTO `target_times` (`id`, `station_id`, `target_minutes`, `created_at`, `updated_at`) VALUES
(961, 'Station 1', 6, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(962, 'Station 10', 8, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(963, 'Station 11', 22, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(964, 'Station 12', 5, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(965, 'Station 13', 10, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(966, 'Station 14', 8, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(967, 'Station 15', 5, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(968, 'Station 2', 8, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(969, 'Station 3', 3, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(970, 'Station 4', 12, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(971, 'Station 5', 15, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(972, 'Station 6', 15, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(973, 'Station 7', 3, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(974, 'Station 8', 15, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(975, 'Station 9', 480, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(976, 'Station1', 480, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(977, 'Station10', 12, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(978, 'Station11', 22, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(979, 'Station12', 5, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(980, 'Station13', 10, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(981, 'Station14', 8, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(982, 'Station15', 5, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(983, 'Station2', 0, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(984, 'Station3', 15, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(985, 'Station4', 12, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(986, 'Station5', 15, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(987, 'Station6', 15, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(988, 'Station7', 3, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(989, 'Station8', 15, '2026-02-04 16:33:38', '2026-02-04 16:33:38'),
(990, 'Station9', 480, '2026-02-04 16:33:38', '2026-02-04 16:33:38');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `unit_history`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `unit_pcba_details`
--

CREATE TABLE `unit_pcba_details` (
  `id` int(11) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `assembly_no` varchar(50) DEFAULT NULL,
  `mnbd_board_no` varchar(100) DEFAULT NULL,
  `cmbd_board_no` varchar(100) DEFAULT NULL,
  `lrbd_board_no` varchar(100) DEFAULT NULL,
  `pqbd_board_no` varchar(100) DEFAULT NULL,
  `bkbd_board_no` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

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

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `full_name`, `station`, `created_at`, `avatar_url`) VALUES
(1, 'carl@mkff.com', 'carl123', 'Administrator', 'Carl Ivan Simbulan', '', '2025-11-27 01:58:32', 'avatar_1_1764592123.png'),
(2, 'shane@mkff.com', 'shane123', 'Operator', 'Shane Villars', 'Station1', '2025-11-27 01:58:32', 'avatar_2_1764254695.png'),
(3, 'ralph@mkff.com', 'ralph123', 'IT Assistant', 'Ralph Howard', '', '2025-11-27 01:58:32', 'avatar_3_1768569884.jpg'),
(4, 'james@mkff.com', 'james123', 'Operator', 'Lebron James', 'Station2', '2025-11-28 06:33:33', 'avatar_4_1768569264.jfif'),
(5, 'bronny@mkff.com', 'bronny123', 'Operator', 'bronny James', 'Station3', '2025-11-28 06:40:07', 'avatar_5_1764312041.png'),
(6, 'clark@mkff.com', 'clark123', 'Operator', 'Caitlin Clark', 'Station6', '2025-11-28 06:43:15', 'avatar_6_1764312236.png'),
(7, 'luka@mkff.com', 'luka123', 'Operator', 'Luka Doncic', 'Station4', '2025-11-28 06:45:55', 'avatar_7_1767966781.png'),
(11, 'lee@mkff.com', 'lee123', 'Operator', 'Bruce Lee', 'Station10', '2025-12-16 14:48:19', 'avatar_11_1765896528.png'),
(12, 'john@mkff.com', 'john123', 'Operator', 'john cena', 'Station7', '2026-01-25 06:43:38', NULL),
(13, 'pablo@mkff.com', 'pablo123', 'Operator', 'pablo ko', 'Station8', '2026-01-25 06:53:36', ''),
(14, 'joe@mkff.com', 'joe123', 'Operator', 'joe@mkff.com', 'Station12', '2026-01-25 07:13:06', NULL),
(15, 'cheenee@mkff.com', 'cheenee123', 'Operator', 'Cheenee pepa', 'Station11', '2026-01-25 07:13:41', ''),
(16, 'choco@mkff.com', 'choco123', 'Operator', 'choco aso', 'Station9', '2026-01-25 07:15:00', NULL),
(17, 'bella@mkff.com', 'bella123', 'Operator', 'bella poch', 'Station13', '2026-01-25 07:15:17', NULL),
(18, 'jake@mkff.com', 'jake123', 'Operator', 'jake fuenca', 'Station14', '2026-01-25 07:15:38', 'avatar_18_1769329589.jpg'),
(19, 'sinio@mkff.com', 'sinio123', 'Operator', 'sinio bau', 'Station15', '2026-01-25 07:15:56', 'avatar_19_1769670149.webp'),
(20, 'kyrie@mkff.com', 'kyri123', 'Operator', 'kyrie irving', 'Station5', '2026-01-27 17:45:29', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `board_edit_requests`
--
ALTER TABLE `board_edit_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station1_checklists`
--
ALTER TABLE `station1_checklists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indexes for table `station2_checklists`
--
ALTER TABLE `station2_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station3_checklists`
--
ALTER TABLE `station3_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station4_checklists`
--
ALTER TABLE `station4_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station5_checklists`
--
ALTER TABLE `station5_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station6_checklists`
--
ALTER TABLE `station6_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station7_checklists`
--
ALTER TABLE `station7_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station8_checklists`
--
ALTER TABLE `station8_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station9_checklists`
--
ALTER TABLE `station9_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station10_checklists`
--
ALTER TABLE `station10_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station11_checklists`
--
ALTER TABLE `station11_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station12_checklists`
--
ALTER TABLE `station12_checklists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indexes for table `station13_checklists`
--
ALTER TABLE `station13_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station14_checklists`
--
ALTER TABLE `station14_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `target_times`
--
ALTER TABLE `target_times`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `station_id` (`station_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_serial_no` (`device_serial_no`);

--
-- Indexes for table `unit_history`
--
ALTER TABLE `unit_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indexes for table `unit_pcba_details`
--
ALTER TABLE `unit_pcba_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `board_edit_requests`
--
ALTER TABLE `board_edit_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_reports`
--
ALTER TABLE `daily_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station1_checklists`
--
ALTER TABLE `station1_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `station2_checklists`
--
ALTER TABLE `station2_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `station3_checklists`
--
ALTER TABLE `station3_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station4_checklists`
--
ALTER TABLE `station4_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station5_checklists`
--
ALTER TABLE `station5_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station6_checklists`
--
ALTER TABLE `station6_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station7_checklists`
--
ALTER TABLE `station7_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station8_checklists`
--
ALTER TABLE `station8_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station9_checklists`
--
ALTER TABLE `station9_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station10_checklists`
--
ALTER TABLE `station10_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station11_checklists`
--
ALTER TABLE `station11_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station12_checklists`
--
ALTER TABLE `station12_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station13_checklists`
--
ALTER TABLE `station13_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `station14_checklists`
--
ALTER TABLE `station14_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `target_times`
--
ALTER TABLE `target_times`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=991;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=606;

--
-- AUTO_INCREMENT for table `unit_history`
--
ALTER TABLE `unit_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=722;

--
-- AUTO_INCREMENT for table `unit_pcba_details`
--
ALTER TABLE `unit_pcba_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `station1_checklists`
--
ALTER TABLE `station1_checklists`
  ADD CONSTRAINT `station1_checklists_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `station12_checklists`
--
ALTER TABLE `station12_checklists`
  ADD CONSTRAINT `station12_checklists_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `unit_history`
--
ALTER TABLE `unit_history`
  ADD CONSTRAINT `unit_history_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `unit_pcba_details`
--
ALTER TABLE `unit_pcba_details`
  ADD CONSTRAINT `unit_pcba_details_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
