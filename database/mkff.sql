-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 12, 2026 at 04:06 AM
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

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `user_id`, `content`, `created_at`) VALUES
(1, 1, 'NEW ANNOUNCEMENT', '2026-02-05 15:42:30'),
(2, 1, 'SUP ANNOUNCEMENT', '2026-02-06 14:23:39');

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

--
-- Dumping data for table `board_edit_requests`
--

INSERT INTO `board_edit_requests` (`id`, `unit_id`, `assembly_no`, `board_type`, `column_name`, `old_value`, `new_value`, `requested_by`, `status`, `requested_at`, `approved_by`, `approved_at`, `remarks`) VALUES
(1, 1008, 'ASSY-00002', 'LRBD', 'lrbd_board_no', '895179', '638161', 'shane@mkff.com', 'approved', '2026-02-05 05:16:17', 'Admin', '2026-02-12 02:20:52', 'weq');

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

--
-- Dumping data for table `daily_reports`
--

INSERT INTO `daily_reports` (`id`, `station`, `report_date`, `shift`, `total_units_processed`, `total_ng`, `downtime_minutes`, `summary`, `attachment_filename`, `submitted_by`, `created_at`) VALUES
(1, 'Station1', '2025-11-28', 'Day Shift', 20, 1, 0, 'example', NULL, 'shane@mkff.com', '2026-02-05 15:19:58'),
(2, 'Station1', '2026-02-05', 'Day Shift', 10, 1, 0, 'ye', NULL, 'shane@mkff.com', '2026-02-05 15:22:07'),
(3, 'Station1', '2026-02-05', 'Day Shift', 10, 4, 0, 'wefrwerf', NULL, 'shane@mkff.com', '2026-02-05 15:34:41'),
(4, 'Station1', '2026-02-06', 'Day Shift', 5, 0, 0, 'wefwe', NULL, 'shane@mkff.com', '2026-02-05 16:02:53'),
(5, 'overall', '2026-02-06', 'Day Shift', 50, 9, 10, 'EXAMPLESS EXAMPLES', NULL, 'carl@mkff.com', '2026-02-06 14:25:03'),
(6, 'Station2', '2026-02-06', 'Day Shift', 40, 2, 5, 'downnnnnnnnnnnnnnnnnnnnnnnnnnnnnntiome', NULL, 'james@mkff.com', '2026-02-06 14:27:40');

-- --------------------------------------------------------

--
-- Table structure for table `release_pin`
--

CREATE TABLE `release_pin` (
  `id` int(11) NOT NULL,
  `pin` varchar(10) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `release_pin`
--

INSERT INTO `release_pin` (`id`, `pin`, `updated_at`, `updated_by`) VALUES
(1, '2026', '2026-02-12 02:57:12', 'Admin');

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

--
-- Dumping data for table `station1_checklists`
--

INSERT INTO `station1_checklists` (`id`, `unit_id`, `assembly_no`, `header_seated_90_deg`, `leads_properly_soldered`, `created_at`) VALUES
(10, 1018, 'ASSY-00001', 'GO', 'GO', '2026-02-06 15:38:06'),
(12, 1017, 'ASSY-00002', 'GO', 'GO', '2026-02-06 16:20:29'),
(14, 1020, 'ASSY-00003', 'GO', 'GO', '2026-02-06 16:28:10'),
(17, 1035, 'TEST-S1-001', 'NO GO', 'GO', '2026-02-12 01:41:25'),
(18, 1036, 'TEST-S1-002', 'GO', 'NO GO', '2026-02-12 01:41:25'),
(19, 1037, 'TEST-S1-003', 'NO GO', 'NO GO', '2026-02-12 01:41:25');

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
(3, 605, 'HIST-25-EXT-02', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 120.4, 120.4, 121, 120.2, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2025-11-30 06:30:00'),
(4, 1001, 'HIST-23-01', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 118.5, 118.5, 119, 118.2, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2023-05-10 02:30:00'),
(5, 1003, 'HIST-24-01', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 121.2, 121.2, 122, 121.5, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2024-02-20 05:15:00'),
(6, 1005, 'HIST-25-01', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 119.8, 119.8, 120.5, 119.5, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2025-03-05 06:00:00'),
(7, 1007, 'ASSY-00001', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 0, '2026-02-05 03:25:31'),
(8, 801, 'HIST-DISP-23', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 119.5, 0, 0, 0, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2023-06-15 02:30:00'),
(9, 802, 'HIST-DISP-24', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 121.2, 0, 0, 0, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2024-08-20 05:00:00'),
(10, 803, 'HIST-DISP-25', 'Not Detected', 'Not Detected', 'Not Detected', 'Not Detected', 118.8, 0, 0, 0, 'FAIL', 'NO GO', 'NO GO', 'NO GO', 'NO GO', 0, '2025-05-10 06:00:00'),
(11, 1012, 'ASSY-00006', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 0, '2026-02-06 14:47:39'),
(12, 1016, 'ASSY-00007', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 3, '2026-02-06 15:17:34'),
(14, 1018, 'ASSY-00001', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 0, '2026-02-06 15:38:28'),
(24, 1017, 'ASSY-00002', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 0, '2026-02-06 16:21:39'),
(26, 1020, 'ASSY-00003', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 0, '2026-02-06 16:29:39'),
(29, 1022, 'TEST-S2-001', 'Detected', 'Passed', 'Detected', 'GO', 112.5, 112.3, 112.8, 112.1, 'FAIL', 'NO GO', 'SOLID GREEN', 'GO', 'NO GO', 3, '2026-02-12 00:41:25'),
(30, 1023, 'TEST-S2-002', 'Not Detected', 'Fail', 'Detected', 'NO GO', 110.2, 109.8, 110.5, 110.1, 'FAIL', 'NO GO', 'OFF', 'NO GO', 'NO GO', 5, '2026-02-11 23:41:25'),
(31, 1024, 'TEST-S2-003', 'Detected', 'Passed', 'Detected', 'GO', 115.2, 115.1, 115.3, 115, 'PASS', 'GO', 'BLINKING', 'NO GO', 'NO GO', 4, '2026-02-12 00:41:25'),
(32, 1025, 'TEST-S2-004', 'Detected', 'Passed', 'Detected', 'GO', 115.8, 115.5, 115.9, 115.6, 'FAIL', 'GO', 'SOLID GREEN', 'GO', 'NO GO', 3, '2026-02-12 00:41:25'),
(33, 1051, 'TEST-NG-001', 'Not Detected', 'Fail', 'Detected', 'NO GO', 112.5, 0, 0, 0, 'FAIL', 'NO GO', 'OFF', 'NO GO', 'NO GO', 0, '2026-02-11 23:41:25');

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

--
-- Dumping data for table `station3_checklists`
--

INSERT INTO `station3_checklists` (`id`, `unit_id`, `assembly_no`, `requirements`, `remarks`, `created_at`) VALUES
(1, 1012, 'ASSY-00006', 'Passed', 'passed examples', '2026-02-06 14:48:30'),
(2, 1016, 'ASSY-00007', 'Passed', '', '2026-02-06 15:18:15'),
(3, 1018, 'ASSY-00001', 'Passed', '', '2026-02-06 15:53:39'),
(4, 1017, 'ASSY-00002', 'Passed', '', '2026-02-06 16:22:15'),
(5, 1020, 'ASSY-00003', 'Passed', '', '2026-02-06 16:30:24'),
(6, 1041, 'TEST-S3-001', 'Not Passed', 'Material not available', '2026-02-12 01:41:25'),
(7, 1042, 'TEST-S3-002', 'Not Passed', 'Equipment malfunction', '2026-02-12 01:41:25');

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

--
-- Dumping data for table `station4_checklists`
--

INSERT INTO `station4_checklists` (`id`, `unit_id`, `assembly_no`, `requirements`, `remarks`, `created_at`) VALUES
(1, 1012, 'ASSY-00006', 'Passed', 'passesdss', '2026-02-06 14:49:24'),
(2, 1016, 'ASSY-00007', 'Passed', '', '2026-02-06 15:18:57'),
(3, 1018, 'ASSY-00001', 'Passed', '', '2026-02-06 15:54:20'),
(5, 1020, 'ASSY-00003', 'Passed', '', '2026-02-06 16:30:53'),
(6, 1047, 'TEST-S4-001', 'Not Passed', 'RTV curing slowly', '2026-02-12 01:41:25'),
(7, 1048, 'TEST-S4-002', 'Not Passed', 'Application equipment issue', '2026-02-12 01:41:25');

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

--
-- Dumping data for table `station5_checklists`
--

INSERT INTO `station5_checklists` (`id`, `unit_id`, `assembly_no`, `requirements`, `remarks`, `created_at`) VALUES
(1, 1012, 'ASSY-00006', 'Passed', 'passed', '2026-02-06 14:50:43'),
(2, 1016, 'ASSY-00007', 'Passed', '', '2026-02-06 15:20:03'),
(3, 1018, 'ASSY-00001', 'Passed', '', '2026-02-06 15:55:36'),
(4, 1020, 'ASSY-00003', 'Passed', '', '2026-02-06 16:31:22'),
(5, 1043, 'TEST-S5-001', 'Not Passed', 'Casing not fitting properly', '2026-02-12 00:41:25'),
(6, 1044, 'TEST-S5-002', 'Not Passed', 'Harness too short', '2026-02-12 00:41:25');

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

--
-- Dumping data for table `station6_checklists`
--

INSERT INTO `station6_checklists` (`id`, `unit_id`, `assembly_no`, `lora_module`, `lora_mesh_test`, `energy_meter`, `power_good_test`, `voltage`, `line1`, `line2`, `line3`, `temp_reading`, `freq_reading`, `led_status_4g`, `led_status_fast_blink`, `go_no_go`, `test_duration`, `sw1_off_to_led_off_duration`, `created_at`) VALUES
(1, 1012, 'ASSY-00006', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', NULL, 2, '2026-02-06 14:52:03'),
(2, 1016, 'ASSY-00007', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', NULL, 0, '2026-02-06 15:20:30'),
(3, 1018, 'ASSY-00001', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', NULL, 0, '2026-02-06 15:56:04'),
(4, 1020, 'ASSY-00003', 'Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', NULL, 0, '2026-02-06 16:31:41'),
(5, 1026, 'TEST-S6-001', 'Detected', 'Passed', 'Detected', 'GO', 113.2, 113, 113.5, 112.8, 'PASS', 'GO', 'SOLID GREEN', 'GO', 'NO GO', NULL, 3, '2026-02-11 23:41:25'),
(6, 1027, 'TEST-S6-002', 'Detected', 'Passed', 'Not Detected', 'NO GO', 114.8, 114.5, 114.9, 114.6, 'PASS', 'GO', 'SOLID GREEN', 'GO', 'NO GO', NULL, 3, '2026-02-12 00:41:25'),
(7, 1028, 'TEST-S6-003', 'Detected', 'Fail', 'Detected', 'GO', 112.1, 111.8, 112.3, 111.9, 'FAIL', 'NO GO', 'BLINKING', 'NO GO', 'NO GO', NULL, 4, '2026-02-11 23:41:25'),
(8, 1052, 'TEST-NG-002', 'Detected', 'Fail', 'Not Detected', 'NO GO', 110.5, 0, 0, 0, 'FAIL', 'NO GO', 'OFF', 'NO GO', 'NO GO', NULL, 0, '2026-02-11 22:41:25');

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

--
-- Dumping data for table `station7_checklists`
--

INSERT INTO `station7_checklists` (`id`, `unit_id`, `assembly_no`, `requirements`, `remarks`, `created_at`) VALUES
(9, 1018, 'ASSY-00001', 'Passed', '', '2026-02-06 16:00:24'),
(10, 1020, 'ASSY-00003', 'Passed', '', '2026-02-06 16:32:14'),
(11, 1049, 'TEST-S7-001', 'Not Passed', 'Equipment warming up', '2026-02-12 01:41:25'),
(12, 1050, 'TEST-S7-002', 'Not Passed', 'Insulation resistance low', '2026-02-12 01:41:25');

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

--
-- Dumping data for table `station8_checklists`
--

INSERT INTO `station8_checklists` (`id`, `unit_id`, `assembly_no`, `power_unit_disable_lora`, `frequency_band`, `test_input_fields`, `rsso_testing`, `data_outage`, `created_at`) VALUES
(1, 1012, 'ASSY-00006', 'Passed', 'Complete', NULL, 'Passed', 'Passed', '2026-02-06 14:56:22'),
(2, 1012, 'ASSY-00006', 'Passed', 'Complete', '5:20', 'Passed', 'Passed', '2026-02-06 14:56:42'),
(3, 1012, 'ASSY-00006', 'Passed', 'Complete', NULL, 'Passed', 'Passed', '2026-02-06 14:56:48'),
(4, 1016, 'ASSY-00007', 'Passed', 'Complete', NULL, 'Passed', 'Passed', '2026-02-06 15:21:46'),
(5, 1016, 'ASSY-00007', 'Passed', 'Complete', NULL, 'Passed', 'Passed', '2026-02-06 15:21:54'),
(6, 1018, 'ASSY-00001', 'Passed', 'Complete', NULL, 'Passed', 'Passed', '2026-02-06 16:03:08'),
(7, 1020, 'ASSY-00003', 'Passed', 'Complete', NULL, 'Passed', 'Passed', '2026-02-06 16:32:43'),
(8, 1029, 'TEST-S8-001', 'GO', 'Passed', NULL, 'Passed', 'GO', '2026-02-11 14:41:25'),
(9, 1030, 'TEST-S8-002', 'GO', 'Passed', NULL, 'Fail', 'NO GO', '2026-02-11 12:41:25'),
(10, 1031, 'TEST-S8-003', 'NO GO', 'Fail', NULL, 'Passed', 'GO', '2026-02-11 15:41:25');

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

--
-- Dumping data for table `station9_checklists`
--

INSERT INTO `station9_checklists` (`id`, `unit_id`, `assembly_no`, `requirements`, `remarks`, `created_at`) VALUES
(1, 1012, 'ASSY-00006', 'Passed', 'downeee', '2026-02-06 15:06:33'),
(2, 1018, 'ASSY-00001', 'Passed', '', '2026-02-06 16:05:13'),
(3, 1020, 'ASSY-00003', 'Passed', '', '2026-02-06 16:33:10');

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

--
-- Dumping data for table `station10_checklists`
--

INSERT INTO `station10_checklists` (`id`, `unit_id`, `assembly_no`, `requirements`, `remarks`, `created_at`) VALUES
(5, 1018, 'ASSY-00001', 'Passed', '', '2026-02-06 16:07:10'),
(7, 1020, 'ASSY-00003', 'Passed', '', '2026-02-06 16:33:27'),
(8, 1045, 'TEST-S10-001', 'Not Passed', 'Insulation resistance low', '2026-02-12 01:41:25'),
(9, 1046, 'TEST-S10-002', 'Not Passed', 'Equipment needs calibration', '2026-02-12 01:41:25');

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

--
-- Dumping data for table `station11_checklists`
--

INSERT INTO `station11_checklists` (`id`, `unit_id`, `assembly_no`, `led_status`, `low_range`, `medium_range`, `high_range`, `created_at`) VALUES
(1, 1012, 'ASSY-00006', 'Not Passed', 'Not Passed', 'Not Passed', 'Not Passed', '2026-02-06 15:08:50'),
(2, 1020, 'ASSY-00003', 'SOLID GREEN', 'PASSED', 'PASSED', 'PASSED', '2026-02-06 16:33:48'),
(3, 1032, 'TEST-S11-001', 'BLINKING', 'Fail', 'Passed', 'Passed', '2026-02-12 00:41:25'),
(4, 1033, 'TEST-S11-002', 'SOLID GREEN', 'Passed', 'Fail', 'Fail', '2026-02-12 00:41:25'),
(5, 1034, 'TEST-S11-003', 'OFF', 'Fail', 'Fail', 'Passed', '2026-02-12 00:41:25'),
(6, 1053, 'TEST-NG-003', 'OFF', 'Fail', 'Fail', 'Fail', '2026-02-12 00:41:25');

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

--
-- Dumping data for table `station12_checklists`
--

INSERT INTO `station12_checklists` (`id`, `unit_id`, `assembly_no`, `stickers_attached`, `stickers_readable`, `created_at`) VALUES
(3, 1020, 'ASSY-00003', 'GO', 'GO', '2026-02-06 16:41:58'),
(4, 1038, 'TEST-S12-001', 'NO GO', 'GO', '2026-02-12 01:41:25'),
(5, 1039, 'TEST-S12-002', 'GO', 'NO GO', '2026-02-12 01:41:25'),
(6, 1040, 'TEST-S12-003', 'NO GO', 'NO GO', '2026-02-12 01:41:25');

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

--
-- Dumping data for table `station13_checklists`
--

INSERT INTO `station13_checklists` (`id`, `unit_id`, `assembly_no`, `requirements`, `remarks`, `created_at`) VALUES
(1, 1020, 'ASSY-00003', 'Passed', '', '2026-02-06 16:36:54');

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

--
-- Dumping data for table `station14_checklists`
--

INSERT INTO `station14_checklists` (`id`, `unit_id`, `assembly_no`, `requirements`, `remarks`, `created_at`) VALUES
(1, 1020, 'ASSY-00003', 'Passed', '', '2026-02-06 16:37:16');

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
(1621, 'Station 1', 6, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1622, 'Station 10', 8, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1623, 'Station 11', 22, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1624, 'Station 12', 5, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1625, 'Station 13', 10, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1626, 'Station 14', 8, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1627, 'Station 15', 5, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1628, 'Station 2', 8, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1629, 'Station 3', 3, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1630, 'Station 4', 12, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1631, 'Station 5', 15, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1632, 'Station 6', 15, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1633, 'Station 7', 3, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1634, 'Station 8', 15, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1635, 'Station 9', 480, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1636, 'Station1', 4, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1637, 'Station10', 12, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1638, 'Station11', 22, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1639, 'Station12', 5, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1640, 'Station13', 10, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1641, 'Station14', 8, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1642, 'Station15', 5, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1643, 'Station2', 1, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1644, 'Station3', 15, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1645, 'Station4', 12, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1646, 'Station5', 15, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1647, 'Station6', 15, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1648, 'Station7', 3, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1649, 'Station8', 15, '2026-02-12 02:56:44', '2026-02-12 02:56:44'),
(1650, 'Station9', 480, '2026-02-12 02:56:44', '2026-02-12 02:56:44');

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

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `model`, `revision`, `base_unit_kitting_no`, `assembly_no`, `device_serial_no`, `accessory_kitting_no`, `status`, `remarks`, `station`, `created_at`, `updated_at`) VALUES
(1017, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00002', NULL, NULL, 'Dispatched', 'fyt', 'N/A', '2026-02-06 15:37:07', '2026-02-11 10:03:12'),
(1018, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00001', 'SN-VPQH8M', 'ACC-4EYF95', 'Dispatched', 'yee', 'N/A', '2026-02-06 15:37:07', '2026-02-11 08:27:28'),
(1019, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00004', NULL, NULL, 'Dispatched', NULL, 'N/A', '2026-02-06 15:37:07', '2026-02-12 02:21:28'),
(1020, 'MKFF-X1', 'REV-01', 'KIT-7FL2LO', 'ASSY-00003', 'SN-55KYAU', 'ACC-RMEGDX', 'Dispatched', 'knj', 'N/A', '2026-02-06 15:37:07', '2026-02-11 08:02:18'),
(1021, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00005', NULL, NULL, 'In Progress', 'need to rework on station2', 'Station2', '2026-02-06 15:37:07', '2026-02-12 02:27:17'),
(1022, 'Model-X', 'Rev-A', NULL, 'TEST-S2-001', NULL, NULL, 'In Progress', 'Voltage reading unstable', 'Station2', '2026-02-12 00:41:25', '2026-02-12 01:56:25'),
(1023, 'Model-X', 'Rev-A', NULL, 'TEST-S2-002', NULL, NULL, 'In Progress', 'Multiple test failures', 'Station2', '2026-02-11 23:41:25', '2026-02-12 01:41:25'),
(1024, 'Model-Y', 'Rev-B', NULL, 'TEST-S2-003', NULL, NULL, 'In Progress', 'LED not responding', 'Station2', '2026-02-12 00:41:25', '2026-02-12 02:06:25'),
(1025, 'Model-X', 'Rev-A', NULL, 'TEST-S2-004', NULL, NULL, 'In Progress', 'Temperature too high', 'Station2', '2026-02-12 00:41:25', '2026-02-12 01:51:25'),
(1026, 'Model-X', 'Rev-A', NULL, 'TEST-S6-001', NULL, NULL, 'In Progress', 'Calibration out of range', 'Station6', '2026-02-11 23:41:25', '2026-02-12 01:31:25'),
(1027, 'Model-Y', 'Rev-B', NULL, 'TEST-S6-002', NULL, NULL, 'In Progress', 'Energy meter not responding', 'Station6', '2026-02-12 00:41:25', '2026-02-12 01:46:25'),
(1028, 'Model-X', 'Rev-A', NULL, 'TEST-S6-003', NULL, NULL, 'Dispatched', 'Repeated calibration failures', 'N/A', '2026-02-11 23:41:25', '2026-02-12 02:57:50'),
(1029, 'Model-X', 'Rev-A', NULL, 'TEST-S8-001', NULL, NULL, 'In Progress', 'Waiting for burn-in chamber', 'Station8', '2026-02-11 14:41:25', '2026-02-11 16:41:25'),
(1030, 'Model-Y', 'Rev-B', NULL, 'TEST-S8-002', NULL, NULL, 'In Progress', 'Extended burn-in required', 'Station8', '2026-02-11 12:41:25', '2026-02-11 14:41:25'),
(1031, 'Model-X', 'Rev-A', NULL, 'TEST-S8-003', NULL, NULL, 'In Progress', 'Burn-in equipment issue', 'Station8', '2026-02-11 15:41:25', '2026-02-11 17:41:25'),
(1032, 'Model-X', 'Rev-A', NULL, 'TEST-S11-001', NULL, NULL, 'In Progress', 'Network connectivity issues', 'Station11', '2026-02-12 00:41:25', '2026-02-12 02:01:25'),
(1033, 'Model-Y', 'Rev-B', NULL, 'TEST-S11-002', NULL, NULL, 'In Progress', 'Range test not passing', 'Station11', '2026-02-12 00:41:25', '2026-02-12 01:56:25'),
(1034, 'Model-X', 'Rev-A', NULL, 'TEST-S11-003', NULL, NULL, 'In Progress', 'LED status inconsistent', 'Station11', '2026-02-12 00:41:25', '2026-02-12 02:06:25'),
(1035, 'Model-X', 'Rev-A', NULL, 'TEST-S1-001', NULL, NULL, 'In Progress', 'Header not seated properly', 'Station1', '2026-02-12 01:41:25', '2026-02-12 02:16:25'),
(1036, 'Model-Y', 'Rev-B', NULL, 'TEST-S1-002', NULL, NULL, 'In Progress', 'Soldering quality issues', 'Station1', '2026-02-12 01:41:25', '2026-02-12 02:11:25'),
(1037, 'Model-X', 'Rev-A', NULL, 'TEST-S1-003', NULL, NULL, 'In Progress', 'Rework required', 'Station1', '2026-02-12 01:41:25', '2026-02-12 02:21:25'),
(1038, 'Model-X', 'Rev-A', NULL, 'TEST-S12-001', NULL, NULL, 'In Progress', 'Label printer jammed', 'Station12', '2026-02-12 01:41:25', '2026-02-12 02:23:25'),
(1039, 'Model-Y', 'Rev-B', NULL, 'TEST-S12-002', NULL, NULL, 'In Progress', 'Labels not readable', 'Station12', '2026-02-12 01:41:25', '2026-02-12 02:19:25'),
(1040, 'Model-X', 'Rev-A', NULL, 'TEST-S12-003', NULL, NULL, 'In Progress', 'Waiting for label stock', 'Station12', '2026-02-12 01:41:25', '2026-02-12 02:26:25'),
(1041, 'Model-X', 'Rev-A', NULL, 'TEST-S3-001', NULL, NULL, 'In Progress', 'Coating material shortage', 'Station3', '2026-02-12 01:41:25', '2026-02-12 02:26:25'),
(1042, 'Model-Y', 'Rev-B', NULL, 'TEST-S3-002', NULL, NULL, 'In Progress', 'Coating equipment issue', 'Station3', '2026-02-12 01:41:25', '2026-02-12 02:21:25'),
(1043, 'Model-X', 'Rev-A', NULL, 'TEST-S5-001', NULL, NULL, 'In Progress', 'Casing alignment issues', 'Station5', '2026-02-12 00:41:25', '2026-02-12 02:11:25'),
(1044, 'Model-Y', 'Rev-B', NULL, 'TEST-S5-002', NULL, NULL, 'In Progress', 'Harness routing problem', 'Station5', '2026-02-12 00:41:25', '2026-02-12 02:06:25'),
(1045, 'Model-X', 'Rev-A', NULL, 'TEST-S10-001', NULL, NULL, 'In Progress', 'Hi-Pot test failing', 'Station10', '2026-02-12 01:41:25', '2026-02-12 02:16:25'),
(1046, 'Model-Y', 'Rev-B', NULL, 'TEST-S10-002', NULL, NULL, 'In Progress', 'Test equipment calibration', 'Station10', '2026-02-12 01:41:25', '2026-02-12 02:11:25'),
(1047, 'Model-X', 'Rev-A', NULL, 'TEST-S4-001', NULL, NULL, 'In Progress', 'RTV material curing slowly', 'Station4', '2026-02-12 01:41:25', '2026-02-12 02:16:25'),
(1048, 'Model-Y', 'Rev-B', NULL, 'TEST-S4-002', NULL, NULL, 'In Progress', 'Application equipment issue', 'Station4', '2026-02-12 01:41:25', '2026-02-12 02:23:25'),
(1049, 'Model-X', 'Rev-A', NULL, 'TEST-S7-001', NULL, NULL, 'In Progress', 'Hi-Pot test equipment warm-up', 'Station7', '2026-02-12 01:41:25', '2026-02-12 02:25:25'),
(1050, 'Model-Y', 'Rev-B', NULL, 'TEST-S7-002', NULL, NULL, 'In Progress', 'Insulation test failing', 'Station7', '2026-02-12 01:41:25', '2026-02-12 02:29:25'),
(1051, 'Model-X', 'Rev-A', NULL, 'TEST-NG-001', NULL, NULL, 'No Good (NG)', 'Failed final test - voltage out of spec', 'Station2', '2026-02-11 23:41:25', '2026-02-12 02:01:25'),
(1052, 'Model-Y', 'Rev-B', NULL, 'TEST-NG-002', NULL, NULL, 'No Good (NG)', 'Failed calibration - multiple attempts', 'Station6', '2026-02-11 22:41:25', '2026-02-12 01:11:25'),
(1053, 'Model-X', 'Rev-A', NULL, 'TEST-NG-003', NULL, NULL, 'No Good (NG)', 'Failed connectivity test', 'Station11', '2026-02-12 00:41:25', '2026-02-12 01:51:25');

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

--
-- Dumping data for table `unit_history`
--

INSERT INTO `unit_history` (`history_id`, `unit_id`, `model`, `assembly_no`, `action_type`, `station_name`, `status_after`, `remarks`, `action_by`, `timestamp`) VALUES
(828, 1017, 'MKFF-X1', 'ASSY-00002', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(829, 1018, 'MKFF-X1', 'ASSY-00001', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(830, 1020, 'MKFF-X1', 'ASSY-00003', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(831, 1019, 'MKFF-X1', 'ASSY-00004', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(832, 1021, 'MKFF-X1', 'ASSY-00005', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(833, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(834, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(835, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(836, 1019, 'MKFF-X1', 'ASSY-00004', 'STATION_UPDATE', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(837, 1021, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-02-06 23:37:07'),
(838, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-02-06 23:38:06'),
(839, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'Completed', 'ye', 'shane@mkff.com', '2026-02-06 23:38:14'),
(840, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'ye', 'james@mkff.com', '2026-02-06 23:38:28'),
(841, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'Completed', 'yee', 'james@mkff.com', '2026-02-06 23:39:14'),
(842, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'yee', 'System', '2026-02-06 23:41:41'),
(843, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'yee', 'james@mkff.com', '2026-02-06 23:41:52'),
(844, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'Completed', 'yee', 'james@mkff.com', '2026-02-06 23:42:00'),
(845, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'yee', 'System', '2026-02-06 23:44:26'),
(846, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'Completed', 'yee', 'james@mkff.com', '2026-02-06 23:44:39'),
(847, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'yee', 'System', '2026-02-06 23:47:05'),
(848, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'Completed', 'yee', 'james@mkff.com', '2026-02-06 23:47:19'),
(849, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'yee', 'System', '2026-02-06 23:50:37'),
(850, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'yee', 'james@mkff.com', '2026-02-06 23:51:03'),
(851, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'Completed', 'yee', 'james@mkff.com', '2026-02-06 23:51:10'),
(852, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'yee', 'System', '2026-02-06 23:52:14'),
(853, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'yee', 'james@mkff.com', '2026-02-06 23:52:20'),
(854, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'Completed', 'yee', 'james@mkff.com', '2026-02-06 23:52:28'),
(855, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station3', 'In Progress', 'yee', 'bronny@mkff.com', '2026-02-06 23:53:33'),
(856, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station3', 'Completed', 'yee', 'bronny@mkff.com', '2026-02-06 23:53:39'),
(857, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station4', 'In Progress', 'yee', 'luka@mkff.com', '2026-02-06 23:54:14'),
(858, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station4', 'In Progress', 'yee', 'luka@mkff.com', '2026-02-06 23:54:20'),
(859, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station4', 'Completed', 'yee', 'luka@mkff.com', '2026-02-06 23:54:24'),
(860, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station5', 'In Progress', 'yee', 'kyrie@mkff.com', '2026-02-06 23:55:30'),
(861, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station5', 'Completed', 'yee', 'kyrie@mkff.com', '2026-02-06 23:55:36'),
(862, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'In Progress', 'yee', 'clark@mkff.com', '2026-02-06 23:56:04'),
(863, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'In Progress', 'yee', 'clark@mkff.com', '2026-02-06 23:56:10'),
(864, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'Completed', 'yee', 'clark@mkff.com', '2026-02-06 23:56:15'),
(865, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station7', 'In Progress', 'yee', 'john@mkff.com', '2026-02-06 23:58:11'),
(866, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station7', 'Completed', 'yee', 'john@mkff.com', '2026-02-06 23:58:25'),
(867, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station7', 'In Progress', 'yee', 'System', '2026-02-07 00:00:11'),
(868, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station7', 'Completed', 'yee', 'john@mkff.com', '2026-02-07 00:00:24'),
(869, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station8', 'In Progress', 'yee', 'pablo@mkff.com', '2026-02-07 00:01:16'),
(870, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station8', 'Completed', 'yee', 'pablo@mkff.com', '2026-02-07 00:01:31'),
(871, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station8', 'In Progress', 'yee', 'System', '2026-02-07 00:02:55'),
(872, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station8', 'Completed', 'yee', 'pablo@mkff.com', '2026-02-07 00:03:08'),
(873, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station9', 'In Progress', 'yee', 'choco@mkff.com', '2026-02-07 00:05:02'),
(874, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station9', 'Completed', 'yee', 'choco@mkff.com', '2026-02-07 00:05:13'),
(875, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'In Progress', 'yee', 'lee@mkff.com', '2026-02-07 00:05:42'),
(876, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'Completed', 'yee', 'lee@mkff.com', '2026-02-07 00:05:48'),
(877, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'In Progress', 'yee', 'System', '2026-02-07 00:06:58'),
(878, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'Completed', 'yee', 'lee@mkff.com', '2026-02-07 00:07:10'),
(879, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'In Progress', 'yee', 'System', '2026-02-07 00:08:09'),
(880, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'No Good (NG)', 'yee', 'lee@mkff.com', '2026-02-07 00:08:17'),
(881, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'In Progress', 'yee', 'System', '2026-02-07 00:13:34'),
(882, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'No Good (NG)', 'yee', 'lee@mkff.com', '2026-02-07 00:13:45'),
(883, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'In Progress', 'yee', 'System', '2026-02-07 00:14:05'),
(884, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station10', 'Completed', 'yee', 'lee@mkff.com', '2026-02-07 00:14:16'),
(885, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-02-07 00:20:29'),
(886, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'Completed', NULL, 'shane@mkff.com', '2026-02-07 00:20:37'),
(887, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', NULL, 'james@mkff.com', '2026-02-07 00:21:39'),
(888, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'Completed', 'fyt', 'james@mkff.com', '2026-02-07 00:21:46'),
(889, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station3', 'In Progress', 'fyt', 'bronny@mkff.com', '2026-02-07 00:22:11'),
(890, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station3', 'Completed', 'fyt', 'bronny@mkff.com', '2026-02-07 00:22:15'),
(891, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station3', 'In Progress', 'fyt', 'System', '2026-02-07 00:22:46'),
(892, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station3', 'No Good (NG)', 'fyt', 'bronny@mkff.com', '2026-02-07 00:22:54'),
(893, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station3', 'Completed', 'fyt', 'System', '2026-02-07 00:23:08'),
(894, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station3', 'In Progress', 'fyt', 'System', '2026-02-07 00:23:14'),
(895, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station3', 'Completed', 'fyt', 'bronny@mkff.com', '2026-02-07 00:23:22'),
(896, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-02-07 00:28:10'),
(897, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'No Good (NG)', 'knj', 'shane@mkff.com', '2026-02-07 00:28:19'),
(898, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'In Progress', 'knj', 'System', '2026-02-07 00:28:40'),
(899, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'No Good (NG)', 'knj', 'System', '2026-02-07 00:28:43'),
(900, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'Pending Approval', 'knj', 'System', '2026-02-07 00:28:58'),
(901, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'In Progress', 'knj', 'System', '2026-02-07 00:29:10'),
(902, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'Completed', 'knj', 'shane@mkff.com', '2026-02-07 00:29:23'),
(903, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station2', 'In Progress', 'knj', 'james@mkff.com', '2026-02-07 00:29:39'),
(904, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station2', 'In Progress', 'knj', 'james@mkff.com', '2026-02-07 00:29:44'),
(905, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station2', 'Completed', 'knj', 'james@mkff.com', '2026-02-07 00:29:50'),
(906, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station3', 'In Progress', 'knj', 'bronny@mkff.com', '2026-02-07 00:30:13'),
(907, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station3', 'Completed', 'knj', 'bronny@mkff.com', '2026-02-07 00:30:24'),
(908, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station4', 'In Progress', 'knj', 'luka@mkff.com', '2026-02-07 00:30:47'),
(909, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station4', 'Completed', 'knj', 'luka@mkff.com', '2026-02-07 00:30:53'),
(910, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station5', 'In Progress', 'knj', 'kyrie@mkff.com', '2026-02-07 00:31:17'),
(911, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station5', 'Completed', 'knj', 'kyrie@mkff.com', '2026-02-07 00:31:22'),
(912, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station6', 'In Progress', 'knj', 'clark@mkff.com', '2026-02-07 00:31:41'),
(913, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station6', 'Completed', 'knj', 'clark@mkff.com', '2026-02-07 00:31:45'),
(914, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station7', 'In Progress', 'knj', 'john@mkff.com', '2026-02-07 00:32:14'),
(915, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station7', 'Completed', 'knj', 'john@mkff.com', '2026-02-07 00:32:19'),
(916, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station8', 'In Progress', 'knj', 'pablo@mkff.com', '2026-02-07 00:32:43'),
(917, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station8', 'Completed', 'knj', 'pablo@mkff.com', '2026-02-07 00:32:48'),
(918, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station9', 'In Progress', 'knj', 'choco@mkff.com', '2026-02-07 00:33:06'),
(919, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station9', 'Completed', 'knj', 'choco@mkff.com', '2026-02-07 00:33:10'),
(920, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station10', 'In Progress', 'knj', 'lee@mkff.com', '2026-02-07 00:33:27'),
(921, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station10', 'Completed', 'knj', 'lee@mkff.com', '2026-02-07 00:33:32'),
(922, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station11', 'In Progress', 'knj', 'cheenee@mkff.com', '2026-02-07 00:33:48'),
(923, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station11', 'Completed', 'knj', 'cheenee@mkff.com', '2026-02-07 00:33:54'),
(924, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station12', 'In Progress', 'knj', 'joe@mkff.com', '2026-02-07 00:34:33'),
(925, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station12', 'Completed', 'knj', 'joe@mkff.com', '2026-02-07 00:34:44'),
(926, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station13', 'In Progress', 'knj', 'bella@mkff.com', '2026-02-07 00:36:47'),
(927, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station13', 'Completed', 'knj', 'bella@mkff.com', '2026-02-07 00:36:54'),
(928, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station14', 'In Progress', 'knj', 'jake@mkff.com', '2026-02-07 00:37:12'),
(929, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station14', 'In Progress', 'knj', 'jake@mkff.com', '2026-02-07 00:37:16'),
(930, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station14', 'Completed', 'knj', 'jake@mkff.com', '2026-02-07 00:37:21'),
(931, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station15', 'In Progress', 'knj', 'sinio@mkff.com', '2026-02-07 00:37:54'),
(932, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station12', 'In Progress', 'knj', 'System', '2026-02-07 00:38:46'),
(933, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station12', 'Completed', 'knj', 'joe@mkff.com', '2026-02-07 00:41:03'),
(934, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station12', 'No Good (NG)', 'knj', 'System', '2026-02-07 00:41:48'),
(935, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station12', 'In Progress', 'knj', 'System', '2026-02-07 00:41:51'),
(936, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station12', 'No Good (NG)', 'knj', 'joe@mkff.com', '2026-02-07 00:41:58'),
(937, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station12', 'In Progress', 'knj', 'System', '2026-02-07 00:47:59'),
(938, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station12', 'Completed', 'knj', 'joe@mkff.com', '2026-02-07 00:48:03'),
(939, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'In Progress', 'knj', 'System', '2026-02-07 00:48:34'),
(940, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'No Good (NG)', 'knj', 'shane@mkff.com', '2026-02-07 00:48:43'),
(941, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'In Progress', 'knj', 'System', '2026-02-07 00:49:09'),
(942, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'Completed', 'knj', 'shane@mkff.com', '2026-02-07 00:49:18'),
(943, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station2', 'In Progress', 'knj', 'System', '2026-02-07 00:49:34'),
(944, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'knj', 'james@mkff.com', '2026-02-07 00:49:54'),
(945, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station2', 'In Progress', 'knj', 'System', '2026-02-07 00:50:43'),
(946, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station2', 'Completed', 'knj', 'james@mkff.com', '2026-02-07 00:50:50'),
(947, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station15', 'Completed', 'knj', 'System', '2026-02-07 00:51:04'),
(948, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', 'fyt', 'System', '2026-02-11 11:17:09'),
(949, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'Completed', 'fyt', 'System', '2026-02-11 12:34:10'),
(950, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'Completed', 'fyt', 'System', '2026-02-11 12:37:54'),
(951, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', 'fyt', 'System', '2026-02-11 12:38:04'),
(952, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fyt', 'System', '2026-02-11 12:38:08'),
(953, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'Completed', 'fyt', 'System', '2026-02-11 12:41:33'),
(954, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fyt', 'System', '2026-02-11 12:41:38'),
(955, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', 'fyt', 'System', '2026-02-11 12:55:52'),
(956, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fyt', 'System', '2026-02-11 12:56:22'),
(957, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'Completed', 'fyt', 'System', '2026-02-11 13:01:19'),
(958, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fyt', 'System', '2026-02-11 13:01:22'),
(959, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'fyt', 'System', '2026-02-11 14:04:09'),
(960, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fyt', 'System', '2026-02-11 14:04:12'),
(961, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'fyt', 'System', '2026-02-11 14:10:05'),
(962, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'Completed', 'fyt', 'System', '2026-02-11 14:21:22'),
(963, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fyt', 'System', '2026-02-11 14:21:25'),
(964, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'Completed', 'fyt', 'System', '2026-02-11 14:44:43'),
(965, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'fyt', 'System', '2026-02-11 14:44:45'),
(966, 1020, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'N/A', 'Dispatched', 'knj', 'System', '2026-02-11 16:02:18'),
(967, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station15', 'Completed', 'yee', 'System', '2026-02-11 16:02:59'),
(968, 1018, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'N/A', 'Dispatched', 'yee', 'System', '2026-02-11 16:27:28'),
(969, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', 'fyt', 'System', '2026-02-11 17:58:44'),
(970, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station15', 'Completed', 'fyt', 'System', '2026-02-11 17:59:06'),
(971, 1017, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'N/A', 'Dispatched', 'fyt', 'System', '2026-02-11 18:03:12'),
(972, 1019, 'MKFF-X1', 'ASSY-00004', 'STATION_UPDATE', 'Station15', 'In Progress', NULL, 'System', '2026-02-12 10:15:20'),
(973, 1019, 'MKFF-X1', 'ASSY-00004', 'STATION_UPDATE', 'Station15', 'Completed', NULL, 'System', '2026-02-12 10:15:25'),
(974, 1021, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station15', 'Completed', NULL, 'System', '2026-02-12 10:17:34'),
(975, 1019, 'MKFF-X1', 'ASSY-00004', 'STATION_UPDATE', 'N/A', 'Dispatched', NULL, 'System', '2026-02-12 10:21:28'),
(976, 1021, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station15', 'Pending Approval', 'need to rework on station2', 'System', '2026-02-12 10:22:21'),
(977, 1021, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station15', 'In Progress', 'need to rework on station2', 'System', '2026-02-12 10:23:29'),
(978, 1021, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station15', 'Pending Approval', 'need to rework on station2', 'System', '2026-02-12 10:23:54'),
(979, 1021, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'In Progress', 'need to rework on station2', 'System', '2026-02-12 10:27:17'),
(980, 1028, 'Model-X', 'TEST-S6-003', 'STATION_UPDATE', 'Station15', 'Completed', 'Repeated calibration failures', 'System', '2026-02-12 10:57:35'),
(981, 1028, 'Model-X', 'TEST-S6-003', 'STATION_UPDATE', 'N/A', 'Dispatched', 'Repeated calibration failures', 'System', '2026-02-12 10:57:50');

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

--
-- Dumping data for table `unit_pcba_details`
--

INSERT INTO `unit_pcba_details` (`id`, `unit_id`, `assembly_no`, `mnbd_board_no`, `cmbd_board_no`, `lrbd_board_no`, `pqbd_board_no`, `bkbd_board_no`, `created_at`) VALUES
(48, 1020, 'ASSY-00003', '796048', '877865', '011185', '627346', '866227', '2026-02-06 15:37:07'),
(49, 1019, 'ASSY-00004', '766185', '066437', '191809', '380995', '035761', '2026-02-06 15:37:07'),
(50, 1021, 'ASSY-00005', '249874', '334267', '172536', '794718', '424737', '2026-02-06 15:37:07'),
(54, NULL, 'TEST-S2-001', 'MNBD-2024-001', 'CMBD-2024-001', 'LRBD-2024-001', 'PQBD-2024-001', 'BKBD-2024-001', '2026-02-12 02:47:45'),
(55, NULL, 'TEST-S2-002', 'MNBD-2024-002', 'CMBD-2024-002', 'LRBD-2024-002', 'PQBD-2024-002', 'BKBD-2024-002', '2026-02-12 02:47:45'),
(56, NULL, 'TEST-S2-003', 'MNBD-2024-003', 'CMBD-2024-003', 'LRBD-2024-003', 'PQBD-2024-003', 'BKBD-2024-003', '2026-02-12 02:47:45'),
(57, NULL, 'TEST-S2-004', 'MNBD-2024-004', 'CMBD-2024-004', 'LRBD-2024-004', 'PQBD-2024-004', 'BKBD-2024-004', '2026-02-12 02:47:45'),
(58, NULL, 'TEST-S6-001', 'MNBD-2024-005', 'CMBD-2024-005', 'LRBD-2024-005', 'PQBD-2024-005', 'BKBD-2024-005', '2026-02-12 02:47:45'),
(59, NULL, 'TEST-S6-002', 'MNBD-2024-006', 'CMBD-2024-006', 'LRBD-2024-006', 'PQBD-2024-006', 'BKBD-2024-006', '2026-02-12 02:47:45'),
(60, NULL, 'TEST-S6-003', 'MNBD-2024-007', 'CMBD-2024-007', 'LRBD-2024-007', 'PQBD-2024-007', 'BKBD-2024-007', '2026-02-12 02:47:45'),
(61, NULL, 'TEST-S8-001', 'MNBD-2024-008', 'CMBD-2024-008', 'LRBD-2024-008', 'PQBD-2024-008', 'BKBD-2024-008', '2026-02-12 02:47:45'),
(62, NULL, 'TEST-S8-002', 'MNBD-2024-009', 'CMBD-2024-009', 'LRBD-2024-009', 'PQBD-2024-009', 'BKBD-2024-009', '2026-02-12 02:47:45'),
(63, NULL, 'TEST-S8-003', 'MNBD-2024-010', 'CMBD-2024-010', 'LRBD-2024-010', 'PQBD-2024-010', 'BKBD-2024-010', '2026-02-12 02:47:45'),
(64, NULL, 'TEST-S11-001', 'MNBD-2024-011', 'CMBD-2024-011', 'LRBD-2024-011', 'PQBD-2024-011', 'BKBD-2024-011', '2026-02-12 02:47:45'),
(65, NULL, 'TEST-S11-002', 'MNBD-2024-012', 'CMBD-2024-012', 'LRBD-2024-012', 'PQBD-2024-012', 'BKBD-2024-012', '2026-02-12 02:47:45'),
(66, NULL, 'TEST-S11-003', 'MNBD-2024-013', 'CMBD-2024-013', 'LRBD-2024-013', 'PQBD-2024-013', 'BKBD-2024-013', '2026-02-12 02:47:45'),
(67, NULL, 'TEST-S1-001', 'MNBD-2024-014', 'CMBD-2024-014', 'LRBD-2024-014', 'PQBD-2024-014', 'BKBD-2024-014', '2026-02-12 02:47:45'),
(68, NULL, 'TEST-S1-002', 'MNBD-2024-015', 'CMBD-2024-015', 'LRBD-2024-015', 'PQBD-2024-015', 'BKBD-2024-015', '2026-02-12 02:47:45'),
(69, NULL, 'TEST-S1-003', 'MNBD-2024-016', 'CMBD-2024-016', 'LRBD-2024-016', 'PQBD-2024-016', 'BKBD-2024-016', '2026-02-12 02:47:45'),
(70, NULL, 'TEST-S12-001', 'MNBD-2024-017', 'CMBD-2024-017', 'LRBD-2024-017', 'PQBD-2024-017', 'BKBD-2024-017', '2026-02-12 02:47:45'),
(71, NULL, 'TEST-S12-002', 'MNBD-2024-018', 'CMBD-2024-018', 'LRBD-2024-018', 'PQBD-2024-018', 'BKBD-2024-018', '2026-02-12 02:47:45'),
(72, NULL, 'TEST-S12-003', 'MNBD-2024-019', 'CMBD-2024-019', 'LRBD-2024-019', 'PQBD-2024-019', 'BKBD-2024-019', '2026-02-12 02:47:45'),
(73, NULL, 'TEST-S3-001', 'MNBD-2024-020', 'CMBD-2024-020', 'LRBD-2024-020', 'PQBD-2024-020', 'BKBD-2024-020', '2026-02-12 02:47:45'),
(74, NULL, 'TEST-S3-002', 'MNBD-2024-021', 'CMBD-2024-021', 'LRBD-2024-021', 'PQBD-2024-021', 'BKBD-2024-021', '2026-02-12 02:47:45'),
(75, NULL, 'TEST-S5-001', 'MNBD-2024-022', 'CMBD-2024-022', 'LRBD-2024-022', 'PQBD-2024-022', 'BKBD-2024-022', '2026-02-12 02:47:45'),
(76, NULL, 'TEST-S5-002', 'MNBD-2024-023', 'CMBD-2024-023', 'LRBD-2024-023', 'PQBD-2024-023', 'BKBD-2024-023', '2026-02-12 02:47:45'),
(77, NULL, 'TEST-S10-001', 'MNBD-2024-024', 'CMBD-2024-024', 'LRBD-2024-024', 'PQBD-2024-024', 'BKBD-2024-024', '2026-02-12 02:47:45'),
(78, NULL, 'TEST-S10-002', 'MNBD-2024-025', 'CMBD-2024-025', 'LRBD-2024-025', 'PQBD-2024-025', 'BKBD-2024-025', '2026-02-12 02:47:45'),
(79, NULL, 'TEST-S4-001', 'MNBD-2024-026', 'CMBD-2024-026', 'LRBD-2024-026', 'PQBD-2024-026', 'BKBD-2024-026', '2026-02-12 02:47:45'),
(80, NULL, 'TEST-S4-002', 'MNBD-2024-027', 'CMBD-2024-027', 'LRBD-2024-027', 'PQBD-2024-027', 'BKBD-2024-027', '2026-02-12 02:47:45'),
(81, NULL, 'TEST-S7-001', 'MNBD-2024-028', 'CMBD-2024-028', 'LRBD-2024-028', 'PQBD-2024-028', 'BKBD-2024-028', '2026-02-12 02:47:45'),
(82, NULL, 'TEST-S7-002', 'MNBD-2024-029', 'CMBD-2024-029', 'LRBD-2024-029', 'PQBD-2024-029', 'BKBD-2024-029', '2026-02-12 02:47:45'),
(83, NULL, 'TEST-NG-001', 'MNBD-2024-030', 'CMBD-2024-030', 'LRBD-2024-030', 'PQBD-2024-030', 'BKBD-2024-030', '2026-02-12 02:47:45'),
(84, NULL, 'TEST-NG-002', 'MNBD-2024-031', 'CMBD-2024-031', 'LRBD-2024-031', 'PQBD-2024-031', 'BKBD-2024-031', '2026-02-12 02:47:45'),
(85, NULL, 'TEST-NG-003', 'MNBD-2024-032', 'CMBD-2024-032', 'LRBD-2024-032', 'PQBD-2024-032', 'BKBD-2024-032', '2026-02-12 02:47:45');

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
-- Indexes for table `release_pin`
--
ALTER TABLE `release_pin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `station1_checklists`
--
ALTER TABLE `station1_checklists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_unit` (`unit_id`);

--
-- Indexes for table `station2_checklists`
--
ALTER TABLE `station2_checklists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_unit` (`unit_id`);

--
-- Indexes for table `station3_checklists`
--
ALTER TABLE `station3_checklists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_unit` (`unit_id`);

--
-- Indexes for table `station4_checklists`
--
ALTER TABLE `station4_checklists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_unit` (`unit_id`);

--
-- Indexes for table `station5_checklists`
--
ALTER TABLE `station5_checklists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_unit` (`unit_id`);

--
-- Indexes for table `station6_checklists`
--
ALTER TABLE `station6_checklists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_unit` (`unit_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `board_edit_requests`
--
ALTER TABLE `board_edit_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `daily_reports`
--
ALTER TABLE `daily_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `release_pin`
--
ALTER TABLE `release_pin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `station1_checklists`
--
ALTER TABLE `station1_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `station2_checklists`
--
ALTER TABLE `station2_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `station3_checklists`
--
ALTER TABLE `station3_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `station4_checklists`
--
ALTER TABLE `station4_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `station5_checklists`
--
ALTER TABLE `station5_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `station6_checklists`
--
ALTER TABLE `station6_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `station7_checklists`
--
ALTER TABLE `station7_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `station8_checklists`
--
ALTER TABLE `station8_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `station9_checklists`
--
ALTER TABLE `station9_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `station10_checklists`
--
ALTER TABLE `station10_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `station11_checklists`
--
ALTER TABLE `station11_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `station12_checklists`
--
ALTER TABLE `station12_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `station13_checklists`
--
ALTER TABLE `station13_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `station14_checklists`
--
ALTER TABLE `station14_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `target_times`
--
ALTER TABLE `target_times`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1651;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1054;

--
-- AUTO_INCREMENT for table `unit_history`
--
ALTER TABLE `unit_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=982;

--
-- AUTO_INCREMENT for table `unit_pcba_details`
--
ALTER TABLE `unit_pcba_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

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
