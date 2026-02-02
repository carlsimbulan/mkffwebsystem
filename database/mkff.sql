-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 02, 2026 at 02:42 PM
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
(28, 1, 'hi', '2025-12-06 05:48:15'),
(29, 1, 'hello', '2025-12-06 05:48:24'),
(30, 1, 'kayo at aswang', '2025-12-06 05:49:41'),
(31, 1, 'sup', '2025-12-06 05:59:07'),
(33, 1, '📈 Project & Policy Changes\nThese report announcements related to organizational policy, budget, or major project milestones:\n\n\"The finance department announced a mandatory 10% budget freeze across all non-essential departments, effective immediately.\"\n\n\"An announcement was made detailing the closure of the satellite office in Manila, with operations merging into the main Cebu campus.\"\n\n\"The official press release announced the successful attainment of the Q4 sales targets, leading to anticipated bonuses.\"\n\n\"The policy announcement clearly defined the new remote work guidelines, requiring three days of in-office presence.\"\n\n\"The project lead announced a critical shift in priorities, moving the user interface redesign ahead of backend optimization.\"', '2025-12-06 06:04:01'),
(35, 1, 'example of of of', '2025-12-06 09:56:18'),
(46, 1, 'example announcement', '2025-12-16 14:47:26'),
(47, 1, 'example', '2025-12-17 07:01:51'),
(48, 1, 'exampleee1233333', '2026-01-23 13:37:47'),
(49, 1, 'fwefwe', '2026-01-23 13:45:20');

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
(2, 'Station1', '2025-11-27', 'Day Shift', 5, 0, 0, 'sample 2', 'Station1_2025-11-27_1764243988.jpg', 'shane', '2025-11-27 11:46:28'),
(3, 'Station1', '2025-11-27', 'Day Shift', 5, 1, 0, 'sample 3', 'Station1_2025-11-27_1764244254.jpg', 'shane', '2025-11-27 11:50:54'),
(4, 'Station1', '2025-11-28', 'Day Shift', 13, 1, 2, 'testing report', 'Station1_2025-11-28_1764295215.png', 'shane', '2025-11-28 02:00:15'),
(5, 'Station1', '2025-11-28', 'Day', 4, 3, 0, 'example', NULL, 'N/A', '2025-11-28 06:01:50'),
(6, 'Station1', '2025-11-28', 'Day Shift', 10, 2, 0, 'example', NULL, 'shane@mkff.com', '2025-11-28 09:51:11'),
(7, 'Station1', '2025-11-22', 'Day Shift', 3, 1, 0, 'wqer', NULL, 'shane@mkff.com', '2025-11-28 13:17:59'),
(8, 'Station1', '2025-11-28', 'Day Shift', 5, 1, 0, 'example', 'Station1_2025-11-28_1764336127.png', 'shane@mkff.com', '2025-11-28 13:22:07'),
(9, 'Station1', '2025-11-28', 'Day Shift', 5, 1, 0, 'sample', NULL, 'shane@mkff.com', '2025-11-28 15:13:23'),
(10, 'Station1', '2025-11-29', 'Day Shift', 5, 1, 1, '2', NULL, 'shane@mkff.com', '2025-11-29 12:19:05'),
(11, 'Station5', '2025-11-29', 'Day Shift', 10, 1, 0, 'example', 'Station5_2025-11-29_1764419282.png', 'clark@mkff.com', '2025-11-29 12:28:02'),
(12, 'Station 1', '2025-11-30', 'Day Shift', 5, 1, 0, 'example', 'Station 1_2025-11-30_1764508457.png', 'shane@mkff.com', '2025-11-30 13:14:17'),
(13, 'Station 2', '2025-12-01', 'Day Shift', 2, 3, 1, 'Horizontal lines run from left to right, parallel to the horizon, while vertical lines run from top to bottom, perpendicular to the horizon. For example, a person standing is in a vertical position, and a person lying down is in a horizontal position', NULL, 'james@mkff.com', '2025-12-01 02:13:36'),
(14, 'Station4', '2025-12-04', 'Day', 5, 1, 0, 'example', NULL, 'N/A', '2025-12-04 08:22:31'),
(15, 'Station1', '2025-12-04', 'Day', 10, 1, 0, 'example', NULL, 'N/A', '2025-12-04 10:28:07'),
(16, 'Station1', '2025-12-04', 'Day', 3, 2, 0, 'gr', NULL, 'N/A', '2025-12-04 13:29:15'),
(17, 'Station1', '2025-12-06', 'Day', 5, 1, 0, 'example', NULL, 'N/A', '2025-12-06 03:44:57'),
(18, 'Station 2', '2025-12-06', 'Day Shift', 3, 2, 2, 'sample', NULL, 'james@mkff.com', '2025-12-06 03:46:51'),
(19, 'Station 1', '2025-12-06', 'Day Shift', 3, 1, 0, 'e kasi', NULL, 'shane@mkff.com', '2025-12-06 06:17:56'),
(20, 'Station15', '2025-12-06', 'Day', 3, 1, 0, 'example', NULL, 'N/A', '2025-12-06 09:54:27'),
(21, 'Station 2', '2025-12-06', 'Day Shift', 2, 1, 0, 'examle', NULL, 'james@mkff.com', '2025-12-06 09:57:09'),
(22, 'Station1', '2025-12-11', 'Day', 5, 0, 0, 'weagwre', NULL, 'N/A', '2025-12-11 11:02:50'),
(23, 'Station1', '2025-12-11', 'Day', 23, 2, 3, 'eqfwqegf', 'Station1_2025-12-11_1765451203.png', 'carl@mkff.com', '2025-12-11 11:06:43'),
(24, 'overall', '2025-12-11', 'Day', 100, 1, 10, 'lsgfnbwg bweabg wapb gpuwhbp bpugb we', 'overall_2025-12-11_1765451280.png', 'carl@mkff.com', '2025-12-11 11:08:00'),
(25, 'Station 2', '2025-12-11', 'Day Shift', 7, 1, 0, 'wtgerhge', 'Station 2_2025-12-11_1765451405.pdf', 'james@mkff.com', '2025-12-11 11:10:05'),
(27, 'overall', '2025-12-11', 'Day', 50, 1, 0, ' wvweouib  example', 'overall_2025-12-11_1765452870.png', 'carl@mkff.com', '2025-12-11 11:34:30'),
(28, 'overall', '2025-12-13', 'Day', 50, 2, 1, 'example', 'overall_2025-12-13_1765636381.png', 'carl@mkff.com', '2025-12-13 14:33:01'),
(29, 'Station 2', '2025-12-13', 'Day Shift', 10, 2, 0, '3232323', 'Station 2_2025-12-13_1765636501.png', 'james@mkff.com', '2025-12-13 14:35:01'),
(30, 'Station1', '2025-12-15', 'Day', 3, 0, 0, 'webgwriglwqrhg;ewroiag', 'Station1_2025-12-15_1765811578.png', 'carl@mkff.com', '2025-12-15 15:12:58'),
(31, 'overall', '2025-12-16', 'Day', 50, 2, 0, 'webgiwqgliw', 'overall_2025-12-16_1765895179.pdf', 'carl@mkff.com', '2025-12-16 14:26:19'),
(32, 'overall', '2025-12-16', 'Day', 20, 3, 0, 'etheheytrjh', 'overall_2025-12-16_1765895210.png', 'carl@mkff.com', '2025-12-16 14:26:50'),
(33, 'overall', '2025-12-16', 'Day', 50, 5, 5, 'example', 'overall_2025-12-16_1765896394.png', 'carl@mkff.com', '2025-12-16 14:46:34'),
(34, 'Station 2', '2025-12-16', 'Day Shift', 10, 3, 0, 'exampleeeeeeeeeeeeeeeeeee', 'Station 2_2025-12-16_1765896651.png', 'james@mkff.com', '2025-12-16 14:50:51'),
(35, 'overall', '2025-12-17', 'Day Shift', 50, 10, 5, 'José Rizal was a Filipino nationalist, writer, and reformist who is widely regarded as the national hero of the Philippines. He was born on June 19, 1861, in Calamba, Laguna, during the period of Spanish colonial rule. Rizal was highly intelligent and talented, excelling in many fields such as medicine, literature, and the sciences. He studied ophthalmology to help cure his mother’s eye illness and later continued his studies in Europe.\r\n\r\nRizal is best known for his novels Noli Me Tangere and El Filibusterismo, which exposed the abuses of Spanish friars and officials in the Philippines. Through his writings, he peacefully advocated for reforms, equality, and justice for Filipinos under Spanish rule. His ideas inspired Filipinos to become more aware of their rights and national identity.\r\n\r\nDespite his peaceful approach, the Spanish authorities considered Rizal a threat. He was arrested, exiled, and eventually executed by firing squad on December 30, 1896, in Bagumbayan (now Luneta Park). His death fueled the Philippine Revolution and strengthened the fight for independence. Rizal’s life and works continue to inspire patriotism, courage, and love for country among Filipinos today.', 'overall_2025-12-17_1765956463.pdf', 'carl@mkff.com', '2025-12-17 07:27:43'),
(36, 'Station1', '2026-01-23', 'Day Shift', 10, 1, 1, 'examples ofkdkeknfkje ', NULL, 'carl@mkff.com', '2026-01-23 13:40:21'),
(37, 'Station1', '2026-01-27', 'Day Shift', 5, 1, 1, '1212', NULL, 'carl@mkff.com', '2026-01-27 13:23:13');

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
(5, 173, 'ASSY-00001', 'GO', 'GO', '2026-01-26 13:01:34'),
(6, 177, 'ASSY-00002', 'GO', 'NO GO', '2026-01-27 14:26:23'),
(7, 174, 'ASSY-00007', 'GO', 'GO', '2026-01-27 17:36:05'),
(8, 176, 'ASSY-00008', 'GO', 'GO', '2026-01-27 17:36:13'),
(9, 178, 'ASSY-00003', 'GO', 'GO', '2026-01-27 17:36:18'),
(10, 182, 'ASSY-00005', 'GO', 'NO GO', '2026-01-27 17:36:32'),
(11, 179, 'ASSY-00006', 'GO', 'GO', '2026-01-29 14:11:44');

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
(1, 182, 'ASSY-00005', 'Detected', 'Not Detected', 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 0, '2026-01-30 04:08:58'),
(2, 179, 'ASSY-00006', 'Detected', 'Detected', 'Detected', 'Detected', 115, 111, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 0, '2026-01-30 04:36:22');

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
(1, 182, 'ASSY-00005', 'Passed', 'example', '2026-01-30 04:27:59'),
(2, 179, 'ASSY-00006', 'Passed', 'examples', '2026-01-30 04:37:17');

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

--
-- Dumping data for table `station6_checklists`
--

INSERT INTO `station6_checklists` (`id`, `unit_id`, `assembly_no`, `lora_module`, `lora_mesh_test`, `energy_meter`, `power_good_test`, `voltage`, `line1`, `line2`, `line3`, `temp_reading`, `freq_reading`, `led_status_4g`, `led_status_fast_blink`, `go_no_go`, `test_duration`, `sw1_off_to_led_off_duration`, `created_at`) VALUES
(1, 139, 'ASSY-00005', 'Detected', NULL, 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 120, NULL, '2026-01-24 07:29:37'),
(2, 140, 'ASSY-00004', 'Detected', NULL, 'Detected', 'Detected', 115, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 120, NULL, '2026-01-24 11:04:49'),
(3, 173, 'ASSY-00001', 'Detected', NULL, 'Detected', 'Detected', 115, 115, 13, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 120, NULL, '2026-01-27 14:48:02'),
(4, 177, 'ASSY-00002', 'Detected', NULL, 'Detected', 'Detected', 115, 113, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 120, NULL, '2026-01-27 15:49:30'),
(5, 174, 'ASSY-00007', 'Detected', NULL, 'Detected', 'Detected', 80, 115, 115, 115, 'PASS', 'GO', 'GO', 'GO', 'GO', 120, NULL, '2026-01-27 18:17:56'),
(6, 179, 'ASSY-00006', 'Not Detected', 'Detected', 'Detected', 'Detected', 115, 115, 115, 80, 'PASS', 'GO', 'GO', 'GO', 'GO', 120, 0, '2026-01-29 14:14:32');

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
(601, 'Station 1', 6, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(602, 'Station 10', 8, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(603, 'Station 11', 22, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(604, 'Station 12', 5, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(605, 'Station 13', 10, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(606, 'Station 14', 8, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(607, 'Station 15', 5, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(608, 'Station 2', 8, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(609, 'Station 3', 3, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(610, 'Station 4', 12, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(611, 'Station 5', 15, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(612, 'Station 6', 15, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(613, 'Station 7', 3, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(614, 'Station 8', 15, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(615, 'Station 9', 480, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(616, 'Station1', 15, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(617, 'Station10', 12, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(618, 'Station11', 22, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(619, 'Station12', 5, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(620, 'Station13', 10, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(621, 'Station14', 8, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(622, 'Station15', 5, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(623, 'Station2', 25, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(624, 'Station3', 15, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(625, 'Station4', 12, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(626, 'Station5', 15, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(627, 'Station6', 15, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(628, 'Station7', 3, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(629, 'Station8', 15, '2026-02-01 12:05:32', '2026-02-01 12:05:32'),
(630, 'Station9', 480, '2026-02-01 12:05:32', '2026-02-01 12:05:32');

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
(173, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00001', NULL, NULL, 'Dispatched', 'fdgfdg', 'N/A', '2026-01-26 13:00:15', '2026-01-27 17:34:42'),
(174, 'MKFF-X1', 'REV-01', 'KIT-TH0578', 'ASSY-00007', 'SN-L45WIE', 'ACC-19MAAI', 'Completed', 'Set to No Good (NG) by system - No remarks provided.', 'Station15', '2026-01-26 13:00:15', '2026-01-30 05:47:37'),
(175, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00004', NULL, NULL, 'For Scanning', NULL, 'N/A', '2026-01-26 13:00:15', '2026-01-26 13:00:15'),
(176, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00008', NULL, NULL, 'No Good (NG)', 'Status manually overridden to NG by Administrator.', 'Station2', '2026-01-26 13:00:15', '2026-01-30 14:07:45'),
(177, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00002', NULL, NULL, 'Dispatched', 'fdewf', 'N/A', '2026-01-26 13:00:15', '2026-01-27 17:31:44'),
(178, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00003', NULL, NULL, 'Pending Approval', 'Status manually overridden to NG by Administrator.', 'Station15', '2026-01-26 13:00:15', '2026-01-29 13:19:49'),
(179, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00006', NULL, NULL, 'No Good (NG)', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'Station2', '2026-01-26 13:00:15', '2026-02-01 11:26:51'),
(180, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00009', NULL, NULL, 'For Scanning', NULL, 'N/A', '2026-01-26 13:00:15', '2026-01-26 13:00:15'),
(181, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00010', NULL, NULL, 'For Scanning', NULL, 'N/A', '2026-01-26 13:00:15', '2026-01-26 13:00:15'),
(182, 'MKFF-X1', 'REV-01', NULL, 'ASSY-00005', NULL, NULL, 'Completed', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'Station3', '2026-01-26 13:00:15', '2026-02-01 08:11:24');

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
(441, 173, 'MKFF-X1', 'ASSY-00001', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(442, 174, 'MKFF-X1', 'ASSY-00007', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(443, 178, 'MKFF-X1', 'ASSY-00003', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(444, 176, 'MKFF-X1', 'ASSY-00008', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(445, 177, 'MKFF-X1', 'ASSY-00002', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(446, 175, 'MKFF-X1', 'ASSY-00004', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(447, 179, 'MKFF-X1', 'ASSY-00006', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(448, 180, 'MKFF-X1', 'ASSY-00009', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(449, 181, 'MKFF-X1', 'ASSY-00010', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(450, 182, 'MKFF-X1', 'ASSY-00005', 'UNIT_CREATED', 'N/A', 'For Scanning', NULL, 'ralph@mkff.com', '2026-01-26 21:00:15'),
(451, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-01-26 21:00:54'),
(452, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'Completed', NULL, 'shane@mkff.com', '2026-01-26 21:01:34'),
(453, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'Pending Approval', 'kasi blah', 'shane@mkff.com', '2026-01-26 21:09:08'),
(454, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'Completed', 'Approved manually by IT Assistant', 'ralph@mkff.com', '2026-01-26 21:14:40'),
(455, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'Pending Approval', 'Approved manually by IT Assistant', 'shane@mkff.com', '2026-01-26 21:16:30'),
(456, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'In Progress', 'Approved by IT Assistant and returned to production line', 'ralph@mkff.com', '2026-01-26 21:16:38'),
(457, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'In Progress', 'Approved by IT Assistant and returned to production line', 'shane@mkff.com', '2026-01-26 21:16:48'),
(458, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station1', 'Completed', 'Approved by IT Assistant and returned to production line', 'shane@mkff.com', '2026-01-26 21:16:54'),
(459, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', NULL, 'james@mkff.com', '2026-01-26 23:39:08'),
(460, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-01-26 23:41:26'),
(461, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'Completed', NULL, 'System', '2026-01-27 21:05:39'),
(462, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'Completed', NULL, 'System', '2026-01-27 21:05:45'),
(463, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'System', '2026-01-27 21:21:45'),
(464, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', NULL, 'System', '2026-01-27 21:21:51'),
(465, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'Completed', NULL, 'System', '2026-01-27 22:20:30'),
(466, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'Completed', NULL, 'System', '2026-01-27 22:20:49'),
(467, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', NULL, 'System', '2026-01-27 22:21:41'),
(468, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'System', '2026-01-27 22:22:48'),
(469, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'No Good (NG)', 'kasi ganito ganiyan', 'shane@mkff.com', '2026-01-27 22:26:23'),
(470, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', 'kasi ganito ganiyan', 'System', '2026-01-27 22:45:01'),
(471, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'DEQWFWQ', 'james@mkff.com', '2026-01-27 22:45:59'),
(472, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'In Progress', 'DEQWFWQ', 'System', '2026-01-27 22:46:48'),
(473, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'Completed', 'DEQWFWQ', 'clark@mkff.com', '2026-01-27 22:48:02'),
(474, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'In Progress', 'DEQWFWQ', 'System', '2026-01-27 22:51:33'),
(475, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'DEQWFWQ', 'clark@mkff.com', '2026-01-27 22:51:45'),
(476, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station12', 'No Good (NG)', 'DEQWFWQ', 'System', '2026-01-27 22:55:54'),
(477, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station12', 'In Progress', 'DEQWFWQ', 'System', '2026-01-27 22:56:00'),
(478, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'In Progress', 'DEQWFWQ', 'System', '2026-01-27 22:58:01'),
(479, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'No Good (NG)', 'kasi ganito ganiyan', 'System', '2026-01-27 22:58:42'),
(480, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'fdgfdg', 'clark@mkff.com', '2026-01-27 23:04:22'),
(481, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'In Progress', 'fdgfdg', 'System', '2026-01-27 23:04:45'),
(482, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'fdgfdg', 'clark@mkff.com', '2026-01-27 23:06:09'),
(483, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'In Progress', 'fdgfdg', 'System', '2026-01-27 23:06:18'),
(484, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'fdgfdg', 'clark@mkff.com', '2026-01-27 23:08:20'),
(485, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'In Progress', 'fdgfdg', 'System', '2026-01-27 23:08:45'),
(486, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', 'kasi ganito ganiyan', 'System', '2026-01-27 23:12:01'),
(488, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'No Good (NG)', 'fdewfwe', 'shane@mkff.com', '2026-01-27 23:26:33'),
(489, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fdewfwe', 'System', '2026-01-27 23:26:40'),
(490, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'fdewf', 'james@mkff.com', '2026-01-27 23:27:04'),
(491, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fdewf', 'System', '2026-01-27 23:39:06'),
(492, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'In Progress', 'fdgfdg', 'System', '2026-01-27 23:39:12'),
(493, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'fdewf', 'System', '2026-01-27 23:39:37'),
(494, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'fdewf', 'System', '2026-01-27 23:44:43'),
(495, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station6', 'In Progress', 'fdewf', 'System', '2026-01-27 23:45:06'),
(496, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'fdewf', 'clark@mkff.com', '2026-01-27 23:49:30'),
(497, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'In Progress', 'fdewf', 'System', '2026-01-27 23:49:40'),
(498, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station1', 'No Good (NG)', 'fdewf', 'shane@mkff.com', '2026-01-27 23:51:32'),
(499, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fdewf', 'System', '2026-01-27 23:51:41'),
(500, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'Completed', 'fdewf', 'james@mkff.com', '2026-01-27 23:52:13'),
(501, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fdewf', 'System', '2026-01-27 23:52:22'),
(502, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'fdgfdg', 'james@mkff.com', '2026-01-27 23:52:28'),
(503, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'In Progress', 'fdgfdg', 'System', '2026-01-27 23:53:42'),
(504, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'fdgfdg', 'clark@mkff.com', '2026-01-27 23:54:40'),
(505, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'Pending Approval', 'fdewf', 'System', '2026-01-28 00:32:26'),
(506, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station2', 'In Progress', 'fdewf', 'System', '2026-01-28 00:32:58'),
(507, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-01-28 01:09:21'),
(508, 176, 'MKFF-X1', 'ASSY-00008', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-01-28 01:09:39'),
(509, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-01-28 01:09:53'),
(510, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-01-28 01:10:11'),
(511, 178, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'shane@mkff.com', '2026-01-28 01:10:43'),
(512, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station15', 'In Progress', 'fdewf', 'System', '2026-01-28 01:15:15'),
(513, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station15', 'Completed', 'fdewf', 'System', '2026-01-28 01:15:32'),
(514, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station15', 'Dispatched', 'fdewf', 'System', '2026-01-28 01:25:14'),
(515, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station15', 'Completed', 'fdewf', 'System', '2026-01-28 01:27:35'),
(516, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station15', 'Dispatched', 'fdewf', 'System', '2026-01-28 01:30:20'),
(517, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'Station15', 'Completed', 'fdewf', 'System', '2026-01-28 01:31:17'),
(518, 177, 'MKFF-X1', 'ASSY-00002', 'STATION_UPDATE', 'N/A', 'Dispatched', 'fdewf', 'System', '2026-01-28 01:31:44'),
(519, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station15', 'No Good (NG)', 'fdgfdg', 'System', '2026-01-28 01:34:27'),
(520, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'Station15', 'Completed', 'fdgfdg', 'System', '2026-01-28 01:34:39'),
(521, 173, 'MKFF-X1', 'ASSY-00001', 'STATION_UPDATE', 'N/A', 'Dispatched', 'fdgfdg', 'System', '2026-01-28 01:34:42'),
(522, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station1', 'Completed', NULL, 'shane@mkff.com', '2026-01-28 01:36:05'),
(523, 176, 'MKFF-X1', 'ASSY-00008', 'STATION_UPDATE', 'Station1', 'Completed', NULL, 'shane@mkff.com', '2026-01-28 01:36:13'),
(524, 178, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station1', 'Completed', NULL, 'shane@mkff.com', '2026-01-28 01:36:18'),
(525, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station1', 'No Good (NG)', 'example', 'shane@mkff.com', '2026-01-28 01:36:32'),
(526, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station2', 'In Progress', NULL, 'james@mkff.com', '2026-01-28 01:43:38'),
(527, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station2', 'Completed', NULL, 'james@mkff.com', '2026-01-28 01:43:46'),
(528, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station3', 'In Progress', NULL, 'bronny@mkff.com', '2026-01-28 01:44:16'),
(529, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station3', 'Completed', NULL, 'bronny@mkff.com', '2026-01-28 01:44:23'),
(530, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station4', 'In Progress', NULL, 'luka@mkff.com', '2026-01-28 01:44:55'),
(531, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station4', 'Completed', NULL, 'luka@mkff.com', '2026-01-28 01:45:02'),
(532, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station5', 'In Progress', NULL, 'kyrie@mkff.com', '2026-01-28 01:46:15'),
(533, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station4', 'Completed', NULL, 'System', '2026-01-28 01:46:56'),
(534, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station5', 'In Progress', NULL, 'kyrie@mkff.com', '2026-01-28 01:55:49'),
(535, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station5', 'Completed', NULL, 'kyrie@mkff.com', '2026-01-28 01:56:04'),
(536, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station6', 'In Progress', NULL, 'clark@mkff.com', '2026-01-28 01:56:41'),
(537, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station5', 'Completed', NULL, 'System', '2026-01-28 02:00:18'),
(538, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station6', 'Completed', NULL, 'System', '2026-01-28 02:01:25'),
(539, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station5', 'Completed', NULL, 'System', '2026-01-28 02:01:33'),
(540, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station4', 'Completed', NULL, 'System', '2026-01-28 02:01:47'),
(541, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station5', 'In Progress', NULL, 'kyrie@mkff.com', '2026-01-28 02:02:58'),
(542, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station5', 'Completed', NULL, 'kyrie@mkff.com', '2026-01-28 02:03:08'),
(543, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station6', 'In Progress', NULL, 'clark@mkff.com', '2026-01-28 02:03:29'),
(544, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station4', 'In Progress', NULL, 'System', '2026-01-28 02:04:30'),
(545, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station4', 'Completed', NULL, 'System', '2026-01-28 02:04:38'),
(546, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station5', 'In Progress', NULL, 'kyrie@mkff.com', '2026-01-28 02:09:50'),
(547, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station5', 'Completed', NULL, 'kyrie@mkff.com', '2026-01-28 02:10:04'),
(548, 176, 'MKFF-X1', 'ASSY-00008', 'STATION_UPDATE', 'Station1', 'In Progress', NULL, 'System', '2026-01-28 02:16:49'),
(549, 176, 'MKFF-X1', 'ASSY-00008', 'STATION_UPDATE', 'Station2', 'In Progress', NULL, 'System', '2026-01-28 02:16:53'),
(550, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station6', 'In Progress', NULL, 'clark@mkff.com', '2026-01-28 02:17:12'),
(551, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station6', 'Completed', NULL, 'clark@mkff.com', '2026-01-28 02:17:56'),
(552, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station10', 'Completed', NULL, 'System', '2026-01-28 02:18:05'),
(553, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station11', 'In Progress', NULL, 'cheenee@mkff.com', '2026-01-28 02:19:18'),
(554, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station1', 'Completed', 'example', 'System', '2026-01-28 06:08:39'),
(555, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station1', 'No Good (NG)', 'example', 'System', '2026-01-28 06:08:55'),
(556, 178, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station15', 'Completed', NULL, 'System', '2026-01-28 06:10:44'),
(557, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station15', 'Completed', NULL, 'System', '2026-01-28 06:11:21'),
(558, 176, 'MKFF-X1', 'ASSY-00008', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'Status manually overridden to NG by Administrator.', 'System', '2026-01-28 06:14:07'),
(559, 176, 'MKFF-X1', 'ASSY-00008', 'STATION_UPDATE', 'Station2', 'Pending Approval', 'Status manually overridden to NG by Administrator.', 'System', '2026-01-28 06:37:19'),
(560, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station15', 'In Progress', NULL, 'System', '2026-01-28 17:35:16'),
(561, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'example', 'System', '2026-01-29 10:01:12'),
(562, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'Completed', 'example', 'System', '2026-01-29 10:15:56'),
(563, 178, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station15', 'No Good (NG)', 'Status manually overridden to NG by Administrator.', 'System', '2026-01-29 14:39:15'),
(564, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'In Progress', 'example', 'System', '2026-01-29 18:00:40'),
(565, 178, 'MKFF-X1', 'ASSY-00003', 'STATION_UPDATE', 'Station15', 'Pending Approval', 'Status manually overridden to NG by Administrator.', 'System', '2026-01-29 21:19:49'),
(566, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'No Good (NG)', 'example', 'System', '2026-01-29 21:23:42'),
(567, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station15', 'Completed', NULL, 'System', '2026-01-29 21:23:51'),
(568, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station1', 'Completed', NULL, 'shane@mkff.com', '2026-01-29 22:11:44'),
(569, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station6', 'In Progress', NULL, 'System', '2026-01-29 22:12:19'),
(570, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'mababa ang reading sa line 2', 'clark@mkff.com', '2026-01-29 22:14:32'),
(571, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station6', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 07:51:57'),
(572, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'mababa ang reading sa line 2', 'clark@mkff.com', '2026-01-30 07:52:41'),
(573, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station6', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 08:02:26'),
(574, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station6', 'No Good (NG)', 'mababa ang reading sa line 2', 'clark@mkff.com', '2026-01-30 08:02:49'),
(575, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'example', 'System', '2026-01-30 10:12:57'),
(576, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'In Progress', 'example', 'System', '2026-01-30 10:17:14'),
(577, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'In Progress', 'example', 'System', '2026-01-30 10:56:31'),
(578, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'Completed', 'example', 'System', '2026-01-30 11:50:47'),
(579, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'In Progress', 'example', 'System', '2026-01-30 11:54:22'),
(580, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'Completed', 'example', 'System', '2026-01-30 12:05:27'),
(581, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'In Progress', 'example', 'System', '2026-01-30 12:05:31'),
(582, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'Completed', 'example', 'james@mkff.com', '2026-01-30 12:08:58'),
(583, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'In Progress', 'example', 'System', '2026-01-30 12:09:49'),
(584, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'Completed', 'example', 'james@mkff.com', '2026-01-30 12:10:07'),
(585, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'In Progress', 'example', 'System', '2026-01-30 12:11:19'),
(586, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'example', 'james@mkff.com', '2026-01-30 12:11:37'),
(587, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station6', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 12:16:22'),
(588, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'In Progress', 'example', 'System', '2026-01-30 12:16:37'),
(589, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station2', 'Completed', 'example', 'james@mkff.com', '2026-01-30 12:17:12'),
(590, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'In Progress', 'example', 'System', '2026-01-30 12:18:17'),
(591, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'Completed', 'example', 'bronny@mkff.com', '2026-01-30 12:24:04'),
(592, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'In Progress', 'example', 'System', '2026-01-30 12:26:26'),
(593, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'Completed', 'example', 'bronny@mkff.com', '2026-01-30 12:27:59'),
(594, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'In Progress', 'example', 'System', '2026-01-30 12:32:17'),
(595, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'Completed', 'exampleasas', 'bronny@mkff.com', '2026-01-30 12:32:30'),
(596, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'Pending Approval', 'exampleasas', 'bronny@mkff.com', '2026-01-30 12:33:17'),
(597, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'In Progress', 'exampleasas', 'System', '2026-01-30 12:33:21'),
(598, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station1', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 12:34:44'),
(599, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station1', 'Completed', 'mababa ang reading sa line 2', 'shane@mkff.com', '2026-01-30 12:35:15'),
(600, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 12:35:51'),
(601, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'Completed', 'mababa ang reading sa line 2', 'james@mkff.com', '2026-01-30 12:36:22'),
(602, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station3', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 12:36:49'),
(603, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station3', 'In Progress', 'mababa ang reading sa line 2', 'bronny@mkff.com', '2026-01-30 12:37:17'),
(604, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station1', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 13:32:52'),
(605, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station1', 'Completed', 'mababa ang reading sa line 2', 'shane@mkff.com', '2026-01-30 13:40:34'),
(606, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 13:41:46'),
(607, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'mababa ang reading sa line 2', 'james@mkff.com', '2026-01-30 13:43:04'),
(608, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'Completed', 'mababa ang reading sa line 2', 'james@mkff.com', '2026-01-30 13:43:26'),
(609, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 13:44:22'),
(610, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'Completed', 'mababa ang reading sa line 2', 'james@mkff.com', '2026-01-30 13:44:30'),
(611, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'mababa ang reading sa line 2', 'System', '2026-01-30 13:44:59'),
(612, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'mababa ang reading sa line 2', 'james@mkff.com', '2026-01-30 13:45:26'),
(613, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', NULL, 'System', '2026-01-30 13:45:47'),
(614, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station15', 'No Good (NG)', 'Set to No Good (NG) by system - No remarks provided.', 'System', '2026-01-30 13:47:33'),
(615, 174, 'MKFF-X1', 'ASSY-00007', 'STATION_UPDATE', 'Station15', 'Completed', 'Set to No Good (NG) by system - No remarks provided.', 'System', '2026-01-30 13:47:37'),
(616, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-30 17:04:15'),
(617, 176, 'MKFF-X1', 'ASSY-00008', 'STATION_UPDATE', 'Station2', 'In Progress', 'Status manually overridden to NG by Administrator.', 'System', '2026-01-30 22:07:37'),
(618, 176, 'MKFF-X1', 'ASSY-00008', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'Status manually overridden to NG by Administrator.', 'System', '2026-01-30 22:07:45'),
(619, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'Completed', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:16:14'),
(620, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:16:29'),
(621, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'Completed', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:18:37'),
(622, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:18:51'),
(623, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'Completed', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:24:58'),
(624, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:35:26'),
(625, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:35:26'),
(626, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:35:26'),
(627, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:35:26'),
(628, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'In Progress', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:36:26'),
(629, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:36:35'),
(630, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'Completed', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-01-31 22:46:49'),
(631, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'Completed', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-02-01 15:49:47'),
(632, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'In Progress', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-02-01 15:50:15'),
(633, 182, 'MKFF-X1', 'ASSY-00005', 'STATION_UPDATE', 'Station3', 'Completed', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'bronny@mkff.com', '2026-02-01 16:11:24'),
(634, 179, 'MKFF-X1', 'ASSY-00006', 'STATION_UPDATE', 'Station2', 'No Good (NG)', 'LoRa module unresponsive after 3 retries; possible cold solder on pins.', 'System', '2026-02-01 19:26:51');

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
(9, 173, 'ASSY-00001', '111111', '222222', '333333', '444444', '555554', '2026-01-26 13:00:54'),
(10, 177, 'ASSY-00002', '121212', '323232', '414141', '656565', '144114', '2026-01-26 15:41:26'),
(11, 174, 'ASSY-00007', '363463', '132432', '345634', '543764', '674576', '2026-01-27 17:09:21'),
(12, 176, 'ASSY-00008', '332463', '364326', '124515', '126324', '745753', '2026-01-27 17:09:39'),
(13, 182, 'ASSY-00005', '256363', '546856', '673457', '906789', '458735', '2026-01-27 17:09:53'),
(14, 179, 'ASSY-00006', '253253', '346342', '243632', '324632', '457345', '2026-01-27 17:10:11'),
(15, 178, 'ASSY-00003', '764576', '456343', '346347', '347437', '457345', '2026-01-27 17:10:43');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `daily_reports`
--
ALTER TABLE `daily_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `station1_checklists`
--
ALTER TABLE `station1_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `station2_checklists`
--
ALTER TABLE `station2_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `station3_checklists`
--
ALTER TABLE `station3_checklists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=631;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=212;

--
-- AUTO_INCREMENT for table `unit_history`
--
ALTER TABLE `unit_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=635;

--
-- AUTO_INCREMENT for table `unit_pcba_details`
--
ALTER TABLE `unit_pcba_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
