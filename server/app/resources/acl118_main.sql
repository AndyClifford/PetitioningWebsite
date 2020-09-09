-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: csse-maria2.canterbury.ac.nz
-- Generation Time: Apr 07, 2020 at 10:36 PM
-- Server version: 10.3.17-MariaDB
-- PHP Version: 7.2.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `acl118_main`
--

-- --------------------------------------------------------

--
-- Table structure for table `Category`
--

CREATE TABLE `Category` (
  `category_id` int(11) NOT NULL,
  `name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Category`
--

INSERT INTO `Category` (`category_id`, `name`) VALUES
(1, 'Animals'),
(2, 'Environment'),
(3, 'Entertainment'),
(4, 'Human rights'),
(5, 'Immigration'),
(6, 'Justice'),
(7, 'Other');

-- --------------------------------------------------------

--
-- Table structure for table `Petition`
--

CREATE TABLE `Petition` (
  `petition_id` int(11) NOT NULL,
  `title` varchar(256) NOT NULL,
  `description` varchar(2048) NOT NULL,
  `author_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `closing_date` datetime DEFAULT NULL,
  `photo_filename` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Petition`
--

INSERT INTO `Petition` (`petition_id`, `title`, `description`, `author_id`, `category_id`, `created_date`, `closing_date`, `photo_filename`) VALUES
(1, 'Don\'t take The Edge TV off the air', 'MediaWorks have said that \"From 01 July 2019, ThreeLife +1 will broadcast on Freeview channel 14 while Edge TV transitions to a HD streaming proposition on ThreeNow, rova and theedge.co.nz.\" (see http://www.screenscribe.net/channels/hot-off-the-press-release-edge-tv-to-go-hd/ for the full press release).\n\nThis means that there will be no more music television channels on free-to-air TV in NZ, ending 16 years of free-to-air music TV that started with C4 in 2003. Music TV is great to put on in the background, especially at businesses such as fast food restaurants, airports, doctors waiting rooms, etc.\n\nAdding a +1 channel for ThreeLife will enable people who miss a TV show by an hour to watch it - but they can already do this using ThreeNow.\n\nWhile it will still be possible to put The Edge TV on a TV, such as plugging in a computer or over Chromecast, this requires another device (as well as a TV), and a good internet connection. This will probably be too much effort for most businesses, and a large portion of home users.\n\nThe content for The Edge TV is still being created for online, why not keep broadcasting it over terrestrial?', 1, 3, '2020-01-23 00:00:00', '2020-12-31 00:00:00', 'petition_1.jpg'),
(2, 'Make CANTA Editorially Independent from the UCSA', 'Canta should not be censored by the UCSA.', 2, 7, '2020-01-12 00:00:00', '2020-12-12 00:00:00', 'petition_2.png'),
(3, 'Ban all single-use plastic', 'It\'s not good for the environment', 3, 2, '2020-01-19 00:00:00', NULL, 'petition_3.jpg'),
(4, 'Increase the refugee quota', 'New Zealand currently accepts 1000 refugees. It should be more.', 4, 5, '2019-10-30 00:00:00', '2020-01-01 00:00:00', 'petition_4.jpg'),
(5, 'Introduce koalas to New Zealand', 'Koalas are functionally extinct in Australia, and could thrive in New Zealand, as many other Australasian species do.  They would not compromise our local eco-system, as koalas typically inhabit open eucalypt woodlands, and the leaves of these trees make up most of their diet.', 5, 1, '2020-01-02 00:00:00', '2020-12-02 00:00:00', 'petition_5.jpg'),
(6, 'Declare a climate emergency in Australia', 'Australia\'s increasing deadly wildfires are caused by climate change. We need to do something about it.', 6, 2, '2020-01-04 00:00:00', '2021-01-04 00:00:00', 'petition_6.jpg'),
(7, 'Make school uniforms optional', 'They should be compulsory when students are representing the school offsite, but not every day.', 7, 4, '2020-01-11 00:00:00', '2020-11-11 00:00:00', 'petition_7.jpg'),
(8, 'Make the minimum wage the living wage', 'The current minimum wage is not enough to live on. It should be increased to $21.15.', 8, 4, '2020-02-04 00:00:00', NULL, 'petition_8.jpg'),
(9, 'Bring back $2 rice!', '$2.50 rice just isn\'t the same', 9, 7, '2024-05-01 00:00:00', NULL, 'petition_9.jpg'),
(10, 'Erect a statue for the Souvlaki man', 'His work deserves to be honoured.', 10, 7, '2020-01-01 00:00:00', '2020-12-31 00:00:00', 'petition_10.jpg'),
(11, 'Make the My Timetable timeout duration longer', 'My Timetable times out after I go onto another tab for a few minutes, forcing me to log back in again to use it.\n\nThere should be the option to disable, or least increase, the timout.', 1, 7, '2020-01-19 00:00:00', NULL, 'petition_11.png'),
(12, 'Reduce UC parking costs', 'It costs too much to park on campus', 4, 7, '2020-01-13 00:00:00', '2020-12-05 00:00:00', 'petition_12.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `Signature`
--

CREATE TABLE `Signature` (
  `signatory_id` int(11) NOT NULL,
  `petition_id` int(11) NOT NULL,
  `signed_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Signature`
--

INSERT INTO `Signature` (`signatory_id`, `petition_id`, `signed_date`) VALUES
(1, 1, '2020-01-23 00:00:00'),
(1, 2, '2020-01-13 00:00:00'),
(1, 11, '2020-01-19 00:00:00'),
(1, 12, '2020-01-19 00:00:00'),
(2, 1, '2020-02-01 00:00:00'),
(2, 2, '2020-01-12 00:00:00'),
(3, 1, '2020-02-02 00:00:00'),
(3, 3, '2020-01-19 00:00:00'),
(3, 4, '2019-12-05 00:00:00'),
(3, 5, '2020-02-05 00:00:00'),
(3, 6, '2020-02-05 00:00:00'),
(3, 7, '2020-02-05 00:00:00'),
(3, 8, '2020-02-05 00:00:00'),
(3, 9, '2020-02-05 00:00:00'),
(3, 10, '2020-02-05 00:00:00'),
(3, 11, '2020-02-05 00:00:00'),
(3, 12, '2020-02-05 00:00:00'),
(4, 4, '2019-10-30 00:00:00'),
(4, 7, '2020-01-15 00:00:00'),
(4, 12, '2020-01-13 00:00:00'),
(5, 1, '2020-02-04 00:00:00'),
(5, 5, '2020-01-02 00:00:00'),
(5, 12, '2020-01-19 00:00:00'),
(6, 6, '2020-01-04 00:00:00'),
(7, 7, '2020-01-11 00:00:00'),
(8, 4, '2019-12-05 00:00:00'),
(8, 8, '2020-02-04 00:00:00'),
(9, 1, '2020-02-05 00:00:00'),
(9, 9, '2020-02-01 00:00:00'),
(10, 1, '2020-01-24 00:00:00'),
(10, 10, '2020-01-01 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `user_id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL,
  `email` varchar(128) NOT NULL,
  `password` varchar(256) NOT NULL COMMENT 'Only store the hash here, not the actual password!',
  `auth_token` varchar(32) DEFAULT NULL,
  `city` varchar(128) DEFAULT NULL,
  `country` varchar(64) DEFAULT NULL,
  `photo_filename` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`user_id`, `name`, `email`, `password`, `auth_token`, `city`, `country`, `photo_filename`) VALUES
(1, 'Eleanor Shellstrop', 'e.shellstrop@hotmail.com', '$2a$10$wSlMP6ib1VQXw7EyYNB6/er2cA4iwqvbuR.kkvJewHMJOAsIShdD.', NULL, 'Phoenix', 'USA', 'user_1.jpg'),
(2, 'Chidi Anagonye', 'c.anagonye@stjohns.edu.au', '$2a$10$AblKupQx.84DVTKX/m8bhOLqxu0ilnd8vPYsDAVrKt/1dpJfCXNLG', NULL, 'Sydney', 'Australia', 'user_2.png'),
(3, 'Tahani Al-Jamil', 'tahani.aljamil@ox.ac.uk', '$2a$10$27fFs7yofsdkni98JgBZR.3.k1tIy3zqee8DDJpLAiRd0B.la7tKq', NULL, 'London', 'UK', 'user_3.gif'),
(4, 'Jason Mendoza', 'boooooortles@hotmail.com', '$2a$10$tqgiYwlrh0E0/TvOOl5UMu6HZES/6SsI4s5BDtNPYrSXUCcltwkJK', NULL, 'Jacksonville', 'USA', NULL),
(5, 'Mindy St. Claire', 'mindystclaire@gmail.com', '$2a$10$PVHOm5QzaIqNV992F6HRkeMPpQvvjHsOiQy2lKQt9c4pR4YEpniqK', NULL, 'Cincinnati', 'USA', NULL),
(6, 'Simone Garnett', 's.garnett@stjohns.edu.au', '$2a$10$cx1fbxy9/FPwbM3SK3Pjx.De6txKqTuO40ZA4H/85Z50V0XOObBEi', NULL, 'Sydney', 'Australia', NULL),
(7, 'Steven Peleaz', 'pillboi@ymail.com', '$2a$10$V5xZTfK7Id/pt8yHK5dpr.urJnJeV.d/ap68xKsLpAcciOrz7Geae', NULL, 'Jacksonville', 'USA', NULL),
(8, 'Larry Hemsworth', 'larryhemsworth@gmail.com', '$2a$10$LLH34HFe/JPyTh.K.HBOi.RTUpeJmxzC00cv8k4Wik9AWdZi8mQWq', 'G5H8M768YUnCsqhICBCDyI0b61QNvXIa', 'Sydney', 'Australia', NULL),
(9, 'Kamilah Al-Jamil', 'kamilah.aljamil@ox.ac.uk', '$2a$10$illN7Sj0rNyDHpyQ05KTDujcUXoLaQIWJEavhtZlgbF9gls5hm6AW', NULL, NULL, NULL, NULL),
(10, 'John Wheaton', 'johnwheaton@gmail.com', '$2a$10$W2d3mJNNRH3vG7OoNBr43OkWMVS64AGsGuA.NK5tZQwkCKH9hL1hO', NULL, 'Los Angeles', 'USA', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Category`
--
ALTER TABLE `Category`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `Petition`
--
ALTER TABLE `Petition`
  ADD PRIMARY KEY (`petition_id`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `Signature`
--
ALTER TABLE `Signature`
  ADD PRIMARY KEY (`signatory_id`,`petition_id`),
  ADD KEY `petition_id` (`petition_id`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `auth_token` (`auth_token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Category`
--
ALTER TABLE `Category`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `Petition`
--
ALTER TABLE `Petition`
  MODIFY `petition_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `User`
--
ALTER TABLE `User`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Petition`
--
ALTER TABLE `Petition`
  ADD CONSTRAINT `Petition_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `User` (`user_id`),
  ADD CONSTRAINT `Petition_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `Category` (`category_id`);

--
-- Constraints for table `Signature`
--
ALTER TABLE `Signature`
  ADD CONSTRAINT `Signature_ibfk_1` FOREIGN KEY (`signatory_id`) REFERENCES `User` (`user_id`),
  ADD CONSTRAINT `Signature_ibfk_2` FOREIGN KEY (`petition_id`) REFERENCES `Petition` (`petition_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
