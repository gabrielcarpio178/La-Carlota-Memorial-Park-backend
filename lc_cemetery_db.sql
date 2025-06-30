-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 29, 2025 at 04:01 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lc_cemetery_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `group_tb`
--

CREATE TABLE `group_tb` (
  `id` int(11) NOT NULL,
  `group_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_tb`
--

INSERT INTO `group_tb` (`id`, `group_name`) VALUES
(2, 'a2'),
(4, 'a4'),
(5, 'b1'),
(6, 'b2'),
(7, 'b3'),
(9, 'c1'),
(11, 'c2');

-- --------------------------------------------------------

--
-- Table structure for table `records_tb`
--

CREATE TABLE `records_tb` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `slot_id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `suffix` varchar(100) NOT NULL,
  `middlename` varchar(10) NOT NULL,
  `born` date NOT NULL,
  `died` date NOT NULL,
  `image_name` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `records_tb`
--

INSERT INTO `records_tb` (`id`, `group_id`, `slot_id`, `firstname`, `lastname`, `suffix`, `middlename`, `born`, `died`, `image_name`) VALUES
(1, 9, 23, 'Eduardo', 'Achurra', 'N/A', 'J', '1936-05-19', '2008-08-07', '1751162289638-334145479.jpg'),
(2, 6, 12, 'Carlos', 'Berings', 'SR', 'B', '1947-12-01', '2007-11-08', '1751162411253-720093957.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `slot`
--

CREATE TABLE `slot` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `slot_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `slot`
--

INSERT INTO `slot` (`id`, `group_id`, `slot_name`) VALUES
(2, 7, 'slot a'),
(4, 7, 'slot b'),
(7, 2, 'slot a'),
(8, 2, 'slot b'),
(9, 4, 'slot a'),
(10, 6, 'slot a'),
(11, 6, 'slot b'),
(12, 6, 'slot c'),
(17, 4, 'slot b'),
(18, 4, 'slot c'),
(19, 7, 'slot c'),
(20, 7, 'slot d'),
(21, 5, 'slot a'),
(22, 5, 'slot b'),
(23, 9, 'slot a'),
(24, 9, 'slot b'),
(25, 9, 'slot c');

-- --------------------------------------------------------

--
-- Table structure for table `user_tb`
--

CREATE TABLE `user_tb` (
  `id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_tb`
--

INSERT INTO `user_tb` (`id`, `firstname`, `lastname`, `role`, `isActive`, `username`, `password`) VALUES
(1, 'gabriel', 'carpio', 'admin', 1, 'admin', '$2b$10$zlmoAtOCVRZBpYEu7JRQ4OzhTMUytGEO9eiCxh9pdqZPq1/95NT92'),
(2, 'gabriel', 'carpio', 'encoder', 0, 'gabriel', '$2b$10$WW5qvDdmbS.rVs8k8j5lQecAYc69/bUPtg.CFt9fiKrtDLZ97QRBu');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `group_tb`
--
ALTER TABLE `group_tb`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `records_tb`
--
ALTER TABLE `records_tb`
  ADD PRIMARY KEY (`id`),
  ADD KEY `slot_id` (`slot_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `slot`
--
ALTER TABLE `slot`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `user_tb`
--
ALTER TABLE `user_tb`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `group_tb`
--
ALTER TABLE `group_tb`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `records_tb`
--
ALTER TABLE `records_tb`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `slot`
--
ALTER TABLE `slot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `user_tb`
--
ALTER TABLE `user_tb`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `records_tb`
--
ALTER TABLE `records_tb`
  ADD CONSTRAINT `records_tb_ibfk_1` FOREIGN KEY (`slot_id`) REFERENCES `slot` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `records_tb_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `group_tb` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `slot`
--
ALTER TABLE `slot`
  ADD CONSTRAINT `slot_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `group_tb` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
