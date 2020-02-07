-- --------------------------------------------------------
-- 호스트:                           127.0.0.1
-- 서버 버전:                       10.4.6-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:               9.5.0.5196
-- --------------------------------------------------------

-- sandyDB 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `sandydb`;
USE `sandyDB`;

-- 테이블 sandyDB.tasks 구조 내보내기
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sequence` int(1) NOT NULL,
  `type` varchar(20) DEFAULT 'TODO',
  `regdate` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=163 DEFAULT CHARSET=utf8;

-- 테이블 sandyDB.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `uid` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `upw` varchar(255) NOT NULL,
  `userName` varchar(100) NOT NULL,
  `nickName` varchar(255) NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
