PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'donor',
  email TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT
, password_hash TEXT);
INSERT INTO users VALUES(1,'Dr. Patricia Reyes','09171234567','admin',NULL,NULL,'2026-02-08T02:11:35.860Z',NULL,NULL);
INSERT INTO users VALUES(2,'Dianne De la Cruz','09839666204','donor',NULL,NULL,'2026-02-08T02:11:36.464Z',NULL,NULL);
INSERT INTO users VALUES(3,'Noel Flores','09762818389','donor',NULL,NULL,'2026-02-08T02:11:37.963Z',NULL,NULL);
INSERT INTO users VALUES(4,'Ana Ramos','09393093311','donor',NULL,NULL,'2026-02-08T02:11:39.097Z',NULL,NULL);
INSERT INTO users VALUES(5,'Luis Lopez','09181103367','donor',NULL,NULL,'2026-02-08T02:11:40.523Z',NULL,NULL);
INSERT INTO users VALUES(6,'Jose Gonzales','09189298285','donor',NULL,NULL,'2026-02-08T02:11:41.752Z',NULL,NULL);
INSERT INTO users VALUES(7,'Rafael Magtibay','09918549484','donor',NULL,NULL,'2026-02-08T02:11:42.776Z',NULL,NULL);
INSERT INTO users VALUES(8,'Liza Magtibay','09006495697','donor',NULL,NULL,'2026-02-08T02:11:44.005Z',NULL,NULL);
INSERT INTO users VALUES(9,'Janelle Rivera','09108243185','donor',NULL,NULL,'2026-02-08T02:11:45.131Z',NULL,NULL);
INSERT INTO users VALUES(10,'Mark Magtibay','09669276351','donor',NULL,NULL,'2026-02-08T02:11:47.282Z',NULL,NULL);
INSERT INTO users VALUES(11,'Noel Bautista','09400785284','donor',NULL,NULL,'2026-02-08T02:11:48.408Z',NULL,NULL);
INSERT INTO users VALUES(12,'Clarisse Bautista','09205403641','donor',NULL,NULL,'2026-02-08T02:11:49.534Z',NULL,NULL);
INSERT INTO users VALUES(13,'Maria Villanueva','09198175273','donor',NULL,NULL,'2026-02-08T02:11:50.661Z',NULL,NULL);
INSERT INTO users VALUES(14,'Arvin Mendoza','09829521555','donor',NULL,NULL,'2026-02-08T02:11:51.978Z',NULL,NULL);
INSERT INTO users VALUES(15,'Ana Rivera','09087906019','donor',NULL,NULL,'2026-02-08T02:11:53.119Z',NULL,NULL);
INSERT INTO users VALUES(16,'Luis Magtibay','09778712828','donor',NULL,NULL,'2026-02-08T02:11:54.219Z',NULL,NULL);
INSERT INTO users VALUES(17,'Jose Magtibay','09719499217','donor',NULL,NULL,'2026-02-08T02:11:55.474Z',NULL,NULL);
INSERT INTO users VALUES(18,'Dianne Ramos','09780634884','donor',NULL,NULL,'2026-02-08T02:11:56.702Z',NULL,NULL);
INSERT INTO users VALUES(19,'Clarisse Pangan','09639868901','donor',NULL,NULL,'2026-02-08T02:11:57.726Z',NULL,NULL);
INSERT INTO users VALUES(20,'Kristine Bautista','09417182143','donor',NULL,NULL,'2026-02-08T02:11:59.057Z',NULL,NULL);
INSERT INTO users VALUES(21,'Arvin Domingo','09694398691','donor',NULL,NULL,'2026-02-08T02:12:00.184Z',NULL,NULL);
INSERT INTO users VALUES(22,'John Donor','09123456789','donor',NULL,NULL,'2026-02-09 07:30:57','2026-02-09 07:30:57',NULL);
INSERT INTO users VALUES(23,'Dr. Sarah Hospital','09223456789','hospital_staff',NULL,NULL,'2026-02-09 07:30:57','2026-02-09 07:30:57',NULL);
INSERT INTO users VALUES(24,'Officer Mike Health','09323456789','health_officer',NULL,NULL,'2026-02-09 07:30:58','2026-02-09 07:30:58',NULL);
INSERT INTO users VALUES(25,'Admin User','09423456789','admin',NULL,NULL,'2026-02-09 07:30:59','2026-02-09 07:30:59',NULL);
INSERT INTO users VALUES(26,'Admin','09412345678','donor',NULL,NULL,'2026-02-10T11:48:51.929Z',NULL,NULL);
INSERT INTO users VALUES(27,'New Test User','09990000111','donor',NULL,NULL,'2026-02-14 20:48:39',NULL,NULL);
INSERT INTO users VALUES(28,'Admin User','0942-345-6789','donor',NULL,NULL,'2026-02-14 23:36:12',NULL,NULL);
INSERT INTO users VALUES(29,'Test User 132861208','09132861208','donor',NULL,NULL,'2026-02-15 01:26:10',NULL,NULL);
INSERT INTO users VALUES(30,'Wrong User','00000000000','donor',NULL,NULL,'2026-02-15 01:45:27',NULL,NULL);
INSERT INTO users VALUES(31,'Test User','1234567890','donor',NULL,NULL,'2026-02-15 05:21:51',NULL,NULL);
INSERT INTO users VALUES(32,'New User','09998887777','user','newuser@test.com',NULL,'2026-02-15T05:26:30.633Z',NULL,'$2a$12$zJspy/iKraNReB9tUK3.geD2txnqe6JwP7UVwmUXmDggpV/e8lkQi');
INSERT INTO users VALUES(33,'Dr. Patricia Reyes','0917-123-4567','donor',NULL,NULL,'2026-02-15 05:47:32',NULL,NULL);
INSERT INTO users VALUES(34,'New Test User XYZ','09999999999','donor',NULL,NULL,'2026-02-15 05:57:10',NULL,NULL);
INSERT INTO users VALUES(35,'Dr. Sarah Hospital','0922-345-6789','donor',NULL,NULL,'2026-02-15 06:42:00',NULL,NULL);
INSERT INTO users VALUES(36,'John Donor','0912-345-6789','donor',NULL,NULL,'2026-02-15 06:42:33',NULL,NULL);
INSERT INTO users VALUES(37,'Office Mike Health','0932-345-6789','donor',NULL,NULL,'2026-02-15 06:42:59',NULL,NULL);
INSERT INTO users VALUES(38,'Test User','09111111111','user','test1771146590794@test.com',NULL,'2026-02-15T09:09:52.260Z',NULL,'$2a$12$wWZAJEM8Q1KPU2Qb0.ICtejeDO2KiwUgem6gKB8OkyG9Eag6ORBsm');
INSERT INTO users VALUES(39,'Test User','09447270798','donor','test1771147270798@test.com',NULL,'2026-02-15T09:21:13.369Z',NULL,'$2a$12$M8zNBU24m9xAH2toKP/lqOX3Bx6eKDEtcFlGFxFK8MC97bC6C9Nxm');
INSERT INTO users VALUES(40,'Admin User','09557270798','admin','admin1771147270798@test.com',NULL,'2026-02-15T09:21:24.168Z',NULL,'$2a$12$OQPtVZJtUNNvy26UoOy8UeSKTVPfirM.3sHd9/yG2Grf4xl300obW');
INSERT INTO users VALUES(41,'Admin User','09888888888','admin','admin1771147691635@test.com',NULL,'2026-02-15T09:28:12.833Z',NULL,'$2a$12$PtrWt7P0UTzK/XyUaHqGye7XaIGvLzGa03YMTL17GzEvHC/XCRlna');
INSERT INTO users VALUES(42,'John Donor','09123456489','donor',NULL,NULL,'2026-02-15T12:09:03.547Z',NULL,NULL);
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY,
  theme_mode TEXT NOT NULL DEFAULT 'system',
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  email_notifications INTEGER NOT NULL DEFAULT 1,
  sms_notifications INTEGER NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'en',
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
INSERT INTO user_preferences VALUES(23,'system',1,1,0,'en','2026-02-10T10:35:24.098Z');
INSERT INTO user_preferences VALUES(25,'light',1,1,0,'en','2026-02-11T10:56:36.436Z');
INSERT INTO user_preferences VALUES(26,'system',1,1,0,'en','2026-02-10T11:48:53.903Z');
INSERT INTO user_preferences VALUES(39,'system',1,1,0,'en',NULL);
CREATE TABLE IF NOT EXISTS donors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT,
  blood_type TEXT NOT NULL,
  contact_number TEXT,
  municipality TEXT,
  availability_status TEXT NOT NULL DEFAULT 'Available',
  last_donation_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  is_deleted INTEGER NOT NULL DEFAULT 0
);
INSERT INTO donors VALUES(1,'Dianne De la Cruz',41,'M','O+','09839666204','Barcelona','Temporarily Unavailable','2025-11-29','Verified donor profile','2026-02-08T02:11:37.035Z',0);
INSERT INTO donors VALUES(2,'Noel Flores',32,'F','A+','09762818389','Casiguran','Available','2026-02-08','Verified donor profile','2026-02-08T02:11:38.580Z',0);
INSERT INTO donors VALUES(3,'Ana Ramos',50,'M','O+','09393093311','Matnog','Available','2025-11-21','Verified donor profile','2026-02-08T02:11:39.602Z',0);
INSERT INTO donors VALUES(4,'Luis Lopez',26,'F','O+','09181103367','Gubat','Temporarily Unavailable','2025-10-21','Verified donor profile','2026-02-08T02:11:41.138Z',1);
INSERT INTO donors VALUES(5,'Jose Gonzales',19,'M','A+','09189298285','Irosin','Available','2026-01-07','Verified donor profile','2026-02-08T02:11:42.234Z',0);
INSERT INTO donors VALUES(6,'Rafael Magtibay',30,'F','B+','09918549484','Irosin','Available','2025-11-27','Verified donor profile','2026-02-08T02:11:43.390Z',0);
INSERT INTO donors VALUES(7,'Liza Magtibay',31,'F','B+','09006495697','Gubat','Temporarily Unavailable','2026-01-06','Verified donor profile','2026-02-08T02:11:44.517Z',0);
INSERT INTO donors VALUES(8,'Janelle Rivera',49,'F','O+','09108243185','Gubat','Available','2026-02-04','Verified donor profile','2026-02-08T02:11:45.643Z',0);
INSERT INTO donors VALUES(9,'Mark Magtibay',32,'F','A+','09669276351','Castilla','Available','2025-11-12','Verified donor profile','2026-02-08T02:11:47.829Z',0);
INSERT INTO donors VALUES(10,'Noel Bautista',46,'F','A+','09400785284','Barcelona','Available','2026-01-18','Verified donor profile','2026-02-08T02:11:48.978Z',0);
INSERT INTO donors VALUES(11,'Clarisse Bautista',28,'F','A-','09205403641','Bulan','Available','2025-12-12','Verified donor profile','2026-02-08T02:11:50.024Z',0);
INSERT INTO donors VALUES(12,'Maria Villanueva',50,'F','B+','09198175273','Juban','Available','2025-12-31','Verified donor profile','2026-02-08T02:11:51.173Z',0);
INSERT INTO donors VALUES(13,'Arvin Mendoza',42,'F','O+','09829521555','Bulusan','Available','2025-11-08','Verified donor profile','2026-02-08T02:11:52.549Z',0);
INSERT INTO donors VALUES(14,'Ana Rivera',30,'F','A+','09087906019','Bulusan','Temporarily Unavailable','2025-11-07','Verified donor profile','2026-02-08T02:11:53.733Z',0);
INSERT INTO donors VALUES(15,'Luis Magtibay',40,'M','A-','09778712828','Casiguran','Available','2025-12-17','Verified donor profile','2026-02-08T02:11:54.859Z',0);
INSERT INTO donors VALUES(16,'Jose Magtibay',43,'M','O+','09719499217','Pilar','Available','2025-11-29','Verified donor profile','2026-02-08T02:11:56.088Z',0);
INSERT INTO donors VALUES(17,'Dianne Ramos',27,'M','A+','09780634884','Sorsogon City','Available','2025-12-11','Verified donor profile','2026-02-08T02:11:57.214Z',0);
INSERT INTO donors VALUES(18,'Clarisse Pangan',38,'M','A+','09639868901','Donsol','Available','2025-11-23','Verified donor profile','2026-02-08T02:11:58.342Z',0);
INSERT INTO donors VALUES(19,'Kristine Bautista',20,'F','B+','09417182143','Donsol','Available','2026-01-25','Verified donor profile','2026-02-08T02:11:59.632Z',0);
INSERT INTO donors VALUES(20,'Arvin Domingo',39,'M','A-','09694398691','Castilla','Temporarily Unavailable','2026-01-22','Verified donor profile','2026-02-08T02:12:00.696Z',0);
INSERT INTO donors VALUES(21,'Alder A. Sus',21,'','A+','09123456789','Castilla','available',NULL,NULL,'2026-02-10T12:47:28.134Z',1);
INSERT INTO donors VALUES(22,'Zyra mae Dizon',30,'Female','O+','09165378648','Irosin','Available',NULL,NULL,'2026-02-11T10:20:46.393Z',0);
CREATE TABLE IF NOT EXISTS donor_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  age INTEGER NOT NULL,
  blood_type TEXT NOT NULL,
  municipality TEXT NOT NULL,
  availability TEXT NOT NULL DEFAULT 'Available',
  status TEXT NOT NULL DEFAULT 'pending',
  review_reason TEXT,
  reviewed_by INTEGER,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT,
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
INSERT INTO donor_registrations VALUES(1,'Dianne De la Cruz','09839666204','dianne.de.la.cruz@gmail.com',41,'O+','Barcelona','Temporarily Unavailable','approved',NULL,1,'2026-01-30T02:11:36.225Z','2026-02-07T02:11:36.225Z','2026-02-04T02:11:36.225Z');
INSERT INTO donor_registrations VALUES(2,'Noel Flores','09762818389','noel.flores@gmail.com',32,'A+','Casiguran','Available','approved',NULL,1,'2026-02-01T02:11:37.667Z','2026-02-05T02:11:37.667Z','2026-02-02T02:11:37.667Z');
INSERT INTO donor_registrations VALUES(3,'Ana Ramos','09393093311','ana.ramos@gmail.com',50,'O+','Matnog','Available','approved',NULL,1,'2026-01-28T02:11:38.860Z','2026-02-02T02:11:38.860Z','2026-02-08T02:11:38.860Z');
INSERT INTO donor_registrations VALUES(4,'Miguel Garcia','09527854101','miguel.garcia@gmail.com',52,'O+','Sorsogon City','Available','rejected','Incomplete eligibility screening',1,'2026-01-27T02:11:39.914Z','2026-01-12T02:11:39.914Z','2026-02-08T02:11:39.914Z');
INSERT INTO donor_registrations VALUES(5,'Luis Lopez','09181103367','luis.lopez@gmail.com',26,'O+','Gubat','Temporarily Unavailable','approved',NULL,1,'2026-02-07T02:11:40.216Z','2026-01-24T02:11:40.216Z','2026-02-07T02:11:40.216Z');
INSERT INTO donor_registrations VALUES(6,'Jose Gonzales','09189298285','jose.gonzales@gmail.com',19,'A+','Irosin','Available','approved',NULL,1,'2026-01-26T02:11:41.445Z','2026-01-14T02:11:41.445Z','2026-02-07T02:11:41.445Z');
INSERT INTO donor_registrations VALUES(7,'Rafael Magtibay','09918549484','rafael.magtibay@gmail.com',30,'B+','Irosin','Available','approved',NULL,1,'2026-01-29T02:11:42.470Z','2026-01-25T02:11:42.470Z','2026-02-04T02:11:42.470Z');
INSERT INTO donor_registrations VALUES(8,'Liza Magtibay','09006495697','liza.magtibay@gmail.com',31,'B+','Gubat','Temporarily Unavailable','approved',NULL,1,'2026-02-08T02:11:43.701Z','2026-01-25T02:11:43.701Z','2026-02-02T02:11:43.701Z');
INSERT INTO donor_registrations VALUES(9,'Janelle Rivera','09108243185','janelle.rivera@gmail.com',49,'O+','Gubat','Available','approved',NULL,1,'2026-01-30T02:11:44.824Z','2026-02-06T02:11:44.824Z','2026-02-06T02:11:44.824Z');
INSERT INTO donor_registrations VALUES(10,'Juan Rivera','09754333075','juan.rivera@gmail.com',35,'B+','Sorsogon City','Temporarily Unavailable','pending',NULL,NULL,NULL,'2026-01-31T02:11:46.668Z','2026-02-02T02:11:46.668Z');
INSERT INTO donor_registrations VALUES(11,'Mark Magtibay','09669276351','mark.magtibay@gmail.com',32,'A+','Castilla','Available','approved',NULL,1,'2026-02-04T02:11:46.975Z','2026-02-07T02:11:46.975Z','2026-02-06T02:11:46.975Z');
INSERT INTO donor_registrations VALUES(12,'Noel Bautista','09400785284','noel.bautista@gmail.com',46,'A+','Barcelona','Available','approved',NULL,1,'2026-02-04T02:11:48.101Z','2026-01-11T02:11:48.101Z','2026-02-08T02:11:48.101Z');
INSERT INTO donor_registrations VALUES(13,'Clarisse Bautista','09205403641','clarisse.bautista@gmail.com',28,'A-','Bulan','Available','approved',NULL,1,'2026-01-29T02:11:49.252Z','2026-02-04T02:11:49.252Z','2026-02-07T02:11:49.252Z');
INSERT INTO donor_registrations VALUES(14,'Maria Villanueva','09198175273','maria.villanueva@gmail.com',50,'B+','Juban','Available','approved',NULL,1,'2026-02-03T02:11:50.353Z','2026-02-03T02:11:50.353Z','2026-02-06T02:11:50.353Z');
INSERT INTO donor_registrations VALUES(15,'Noel Castro','09625365938','noel.castro@gmail.com',40,'AB+','Pilar','Available','pending',NULL,NULL,NULL,'2026-01-28T02:11:51.433Z','2026-02-06T02:11:51.433Z');
INSERT INTO donor_registrations VALUES(16,'Arvin Mendoza','09829521555','arvin.mendoza@gmail.com',42,'O+','Bulusan','Available','approved',NULL,1,'2026-02-01T02:11:51.690Z','2026-01-19T02:11:51.690Z','2026-02-03T02:11:51.690Z');
INSERT INTO donor_registrations VALUES(17,'Ana Rivera','09087906019','ana.rivera@gmail.com',30,'A+','Bulusan','Temporarily Unavailable','approved',NULL,1,'2026-02-05T02:11:52.812Z','2026-01-17T02:11:52.812Z','2026-02-06T02:11:52.812Z');
INSERT INTO donor_registrations VALUES(18,'Luis Magtibay','09778712828','luis.magtibay@gmail.com',40,'A-','Casiguran','Available','approved',NULL,1,'2026-02-03T02:11:53.972Z','2026-01-28T02:11:53.973Z','2026-02-04T02:11:53.973Z');
INSERT INTO donor_registrations VALUES(19,'Jose Magtibay','09719499217','jose.magtibay@gmail.com',43,'O+','Pilar','Available','approved',NULL,1,'2026-02-04T02:11:55.167Z','2026-01-31T02:11:55.167Z','2026-02-08T02:11:55.167Z');
INSERT INTO donor_registrations VALUES(20,'Dianne Ramos','09780634884','dianne.ramos@gmail.com',27,'A+','Sorsogon City','Available','approved',NULL,1,'2026-02-04T02:11:56.395Z','2026-01-23T02:11:56.395Z','2026-02-04T02:11:56.395Z');
INSERT INTO donor_registrations VALUES(21,'Clarisse Pangan','09639868901','clarisse.pangan@gmail.com',38,'A+','Donsol','Available','approved',NULL,1,'2026-01-31T02:11:57.451Z','2026-01-19T02:11:57.451Z','2026-02-02T02:11:57.451Z');
INSERT INTO donor_registrations VALUES(22,'Kristine Bautista','09417182143','kristine.bautista@gmail.com',20,'B+','Donsol','Available','approved',NULL,1,'2026-02-07T02:11:58.750Z','2026-01-27T02:11:58.750Z','2026-02-03T02:11:58.750Z');
INSERT INTO donor_registrations VALUES(23,'Arvin Domingo','09694398691','arvin.domingo@gmail.com',39,'A-','Castilla','Temporarily Unavailable','approved',NULL,1,'2026-02-08T02:11:59.869Z','2026-01-26T02:11:59.869Z','2026-02-02T02:11:59.869Z');
INSERT INTO donor_registrations VALUES(24,'Jose Bautista','09323430846','jose.bautista@gmail.com',33,'A+','Irosin','Available','rejected','Incomplete eligibility screening',1,'2026-01-28T02:12:01.003Z','2026-01-12T02:12:01.003Z','2026-02-05T02:12:01.003Z');
INSERT INTO donor_registrations VALUES(25,'Cris','09686434985',NULL,23,'A+','Irosin','available','pending',NULL,NULL,NULL,'2026-02-08T03:39:32.600Z',NULL);
INSERT INTO donor_registrations VALUES(26,'Aldred M. Gaupo','09811986459',NULL,53,'O+','Magallanes','available','pending',NULL,NULL,NULL,'2026-02-09T06:33:45.615Z',NULL);
INSERT INTO donor_registrations VALUES(27,'Jobel F. Granado','09865432659',NULL,45,'A-','Bulan','available','pending',NULL,NULL,NULL,'2026-02-10T11:40:40.028Z',NULL);
INSERT INTO donor_registrations VALUES(28,'Alder A. Sus','09123456789',NULL,21,'A+','Gubat','available','pending',NULL,NULL,NULL,'2026-02-10T12:02:54.675Z',NULL);
INSERT INTO donor_registrations VALUES(29,'Alder A. Sus','09123456789',NULL,21,'A+','Castilla','available','pending',NULL,NULL,NULL,'2026-02-10T12:07:15.942Z',NULL);
INSERT INTO donor_registrations VALUES(30,'Alder A. Sus','09123456789',NULL,21,'A+','Castilla','available','pending',NULL,NULL,NULL,'2026-02-10T12:11:22.689Z',NULL);
INSERT INTO donor_registrations VALUES(31,'Alder A. Sus','09123456789',NULL,21,'A+','Castilla','available','approved',NULL,NULL,NULL,'2026-02-10T12:23:16.465Z','2026-02-10T12:47:27.528Z');
INSERT INTO donor_registrations VALUES(32,'Alder A. Sus','09123456789',NULL,51,'A+','Castilla','available','pending',NULL,NULL,NULL,'2026-02-10T12:34:03.327Z',NULL);
INSERT INTO donor_registrations VALUES(33,'Denis Guela','09864532689',NULL,53,'AB+','Castilla','available','pending',NULL,NULL,NULL,'2026-02-11T09:28:13.066Z',NULL);
INSERT INTO donor_registrations VALUES(34,'Atong B. Ang','09564389464',NULL,45,'B+','Gubat','available','pending',NULL,NULL,NULL,'2026-02-13T10:04:44.853Z',NULL);
INSERT INTO donor_registrations VALUES(35,'Test Donor','09998887777',NULL,30,'A+','Manila','available','pending',NULL,NULL,NULL,'2026-02-14T12:45:52.979Z',NULL);
INSERT INTO donor_registrations VALUES(36,'Cgj C. Cdfg','09564386468',NULL,54,'AB+','Gubat','available','pending',NULL,NULL,NULL,'2026-02-14T23:39:05.087Z',NULL);
INSERT INTO donor_registrations VALUES(37,'Jsjsj J. Jejej','09561356497',NULL,69,'AB+','Gubat','available','pending',NULL,NULL,NULL,'2026-02-15T00:14:21.469Z',NULL);
INSERT INTO donor_registrations VALUES(38,'Test User 132861208','09132861208',NULL,30,'O+','Quezon City','Available','pending',NULL,NULL,NULL,'2026-02-15T01:26:09.860Z',NULL);
INSERT INTO donor_registrations VALUES(39,'Juan Dela Cruz','09123456789',NULL,25,'A+','Manila','Available','pending',NULL,NULL,NULL,'2026-02-15T01:45:27.953Z',NULL);
INSERT INTO donor_registrations VALUES(40,'Juan Dela Cruz','09123456789',NULL,25,'A+','Manila','Available','pending',NULL,NULL,NULL,'2026-02-15T01:45:28.753Z',NULL);
INSERT INTO donor_registrations VALUES(41,'John Doe','09998887777',NULL,25,'O+','Sorsogon City','available','pending',NULL,NULL,NULL,'2026-02-15T05:41:05.391Z',NULL);
INSERT INTO donor_registrations VALUES(42,'Albert A. Gab','09864379864',NULL,32,'AB-','Bulan','available','pending',NULL,NULL,NULL,'2026-02-15T05:49:57.749Z',NULL);
INSERT INTO donor_registrations VALUES(43,'Test User','09990001111',NULL,25,'O+','Sorsogon City','available','pending',NULL,NULL,NULL,'2026-02-15T05:54:49.806Z',NULL);
INSERT INTO donor_registrations VALUES(44,'Test User','09991234567',NULL,25,'O+','Sorsogon City','available','pending',NULL,NULL,NULL,'2026-02-15T06:00:57.101Z',NULL);
INSERT INTO donor_registrations VALUES(45,'Final Test User','09998887777',NULL,30,'A+','Bulan','available','pending',NULL,NULL,NULL,'2026-02-15T06:04:23.253Z',NULL);
INSERT INTO donor_registrations VALUES(46,'Deploy Test User','09995557777',NULL,25,'B+','Matnog','available','pending',NULL,NULL,NULL,'2026-02-15T06:05:11.065Z',NULL);
INSERT INTO donor_registrations VALUES(47,'Sakk J. Jdjdjx','09765983491',NULL,55,'O+','Gubat','available','pending',NULL,NULL,NULL,'2026-02-15T06:11:15.517Z',NULL);
INSERT INTO donor_registrations VALUES(48,'Reymar B. Gestiada','09568349867',NULL,32,'AB-','Gubat','available','pending',NULL,NULL,NULL,'2026-02-15T12:10:35.660Z',NULL);
CREATE TABLE IF NOT EXISTS donor_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  blood_type TEXT NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT,
  municipality TEXT,
  availability_status TEXT NOT NULL DEFAULT 'Available',
  last_donation_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
INSERT INTO donor_profiles VALUES(1,2,'O+',41,'F','Barcelona','Temporarily Unavailable','2026-02-08','Active community donor','2026-02-08T02:11:36.735Z',NULL);
INSERT INTO donor_profiles VALUES(2,3,'A+',32,'F','Casiguran','Available','2026-02-07','Active community donor','2026-02-08T02:11:38.270Z',NULL);
INSERT INTO donor_profiles VALUES(3,4,'O+',50,'F','Matnog','Available','2026-01-20','Active community donor','2026-02-08T02:11:39.339Z',NULL);
INSERT INTO donor_profiles VALUES(4,5,'O+',26,'F','Gubat','Temporarily Unavailable','2026-01-27','Active community donor','2026-02-08T02:11:40.830Z',NULL);
INSERT INTO donor_profiles VALUES(5,6,'A+',19,'F','Irosin','Available','2026-01-21','Active community donor','2026-02-08T02:11:41.984Z',NULL);
INSERT INTO donor_profiles VALUES(6,7,'B+',30,'M','Irosin','Available','2025-12-11','Active community donor','2026-02-08T02:11:43.083Z',NULL);
INSERT INTO donor_profiles VALUES(7,8,'B+',31,'F','Gubat','Temporarily Unavailable','2025-11-06','Active community donor','2026-02-08T02:11:44.239Z',NULL);
INSERT INTO donor_profiles VALUES(8,9,'O+',49,'F','Gubat','Available','2025-11-28','Active community donor','2026-02-08T02:11:45.367Z',NULL);
INSERT INTO donor_profiles VALUES(9,10,'A+',32,'M','Castilla','Available','2025-11-25','Active community donor','2026-02-08T02:11:47.591Z',NULL);
INSERT INTO donor_profiles VALUES(10,11,'A+',46,'M','Barcelona','Available','2026-01-31','Active community donor','2026-02-08T02:11:48.716Z',NULL);
INSERT INTO donor_profiles VALUES(11,12,'A-',28,'F','Bulan','Available','2025-12-03','Active community donor','2026-02-08T02:11:49.788Z',NULL);
INSERT INTO donor_profiles VALUES(12,13,'B+',50,'M','Juban','Available','2025-10-13','Active community donor','2026-02-08T02:11:50.905Z',NULL);
INSERT INTO donor_profiles VALUES(13,14,'O+',42,'M','Bulusan','Available','2025-12-13','Active community donor','2026-02-08T02:11:52.299Z',NULL);
INSERT INTO donor_profiles VALUES(14,15,'A+',30,'F','Bulusan','Temporarily Unavailable','2026-01-22','Active community donor','2026-02-08T02:11:53.425Z',NULL);
INSERT INTO donor_profiles VALUES(15,16,'A-',40,'M','Casiguran','Available','2025-12-10','Active community donor','2026-02-08T02:11:54.568Z',NULL);
INSERT INTO donor_profiles VALUES(16,17,'O+',43,'F','Pilar','Available','2026-01-26','Active community donor','2026-02-08T02:11:55.784Z',NULL);
INSERT INTO donor_profiles VALUES(17,18,'A+',27,'F','Sorsogon City','Available','2025-10-13','Active community donor','2026-02-08T02:11:56.937Z',NULL);
INSERT INTO donor_profiles VALUES(18,19,'A+',38,'M','Donsol','Available','2025-12-21','Active community donor','2026-02-08T02:11:58.034Z',NULL);
INSERT INTO donor_profiles VALUES(19,20,'B+',20,'M','Donsol','Available','2025-11-11','Active community donor','2026-02-08T02:11:59.365Z',NULL);
INSERT INTO donor_profiles VALUES(20,21,'A-',39,'M','Castilla','Temporarily Unavailable','2025-10-14','Active community donor','2026-02-08T02:12:00.419Z',NULL);
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  location TEXT,
  schedule_at TEXT,
  send_now INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT
);
INSERT INTO alerts VALUES(1,'Urgent O- Units Needed','Sorsogon Provincial Hospital needs O- units for trauma cases today.','urgent','critical','["O-","O+"]','Sorsogon City',NULL,1,'1','sent','2026-02-08T02:12:03.154Z','2026-02-08T02:12:03.154Z','2026-02-08T02:12:03.154Z');
INSERT INTO alerts VALUES(2,'Donation Drive - Gubat','Mobile drive on Feb 18 at Gubat Municipal Hall, 9 AM - 4 PM.','event','medium','["All"]','Gubat',NULL,1,'1','sent','2026-02-08T02:12:03.665Z','2026-02-08T02:12:03.665Z','2026-02-08T02:12:03.665Z');
INSERT INTO alerts VALUES(3,'AB+ Surgery Coverage','AB+ donors needed in Irosin for scheduled surgery this week.','info','high','["AB+"]','Irosin',NULL,1,'1','sent','2026-02-08T02:12:04.280Z','2026-02-08T02:12:04.280Z','2026-02-08T02:12:04.280Z');
INSERT INTO alerts VALUES(4,'Sample alert','This is a sample alert','info','low','["all"]',NULL,NULL,1,'25','sent','2026-02-11T10:22:06.919Z','2026-02-11T10:22:06.919Z','2026-02-11T10:22:06.919Z');
INSERT INTO alerts VALUES(5,'Sample','Sample alert','urgent','medium','["all"]',NULL,NULL,1,'25','sent','2026-02-15T10:51:55.370Z','2026-02-15T10:51:55.370Z','2026-02-15T10:51:55.370Z');
INSERT INTO alerts VALUES(6,'Good day donors','The blood donation is available at Nov. 30 ','urgent','medium','["all"]',NULL,NULL,1,'25','sent','2026-02-15T10:55:55.504Z','2026-02-15T10:55:55.504Z','2026-02-15T10:55:55.504Z');
INSERT INTO alerts VALUES(7,'Sample 2','Sample 2 alert','urgent','medium','["all"]',NULL,NULL,1,'25','sent','2026-02-15T13:01:47.194Z','2026-02-15T13:01:47.194Z','2026-02-15T13:01:47.194Z');
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  data TEXT
);
INSERT INTO notifications VALUES(1,'Urgent O- Units Needed','Sorsogon Provincial Hospital needs O- units for trauma cases today.','Emergency',1,'2026-02-08T02:12:03.390Z','{"alertId":1,"source":"alert"}');
INSERT INTO notifications VALUES(2,'Donation Drive - Gubat','Mobile drive on Feb 18 at Gubat Municipal Hall, 9 AM - 4 PM.','Emergency',1,'2026-02-08T02:12:03.973Z','{"alertId":2,"source":"alert"}');
INSERT INTO notifications VALUES(3,'AB+ Surgery Coverage','AB+ donors needed in Irosin for scheduled surgery this week.','Emergency',1,'2026-02-08T02:12:04.587Z','{"alertId":3,"source":"alert"}');
INSERT INTO notifications VALUES(4,'Welcome to Dugtong','Thank you for registering as a donor. Keep your availability updated.','System',1,'2026-01-29T02:12:04.894Z','{"welcomeId":"86a51864-09a7-4873-8059-569e16b048dd"}');
INSERT INTO notifications VALUES(5,'Welcome to Dugtong','Thank you for registering as a donor. Keep your availability updated.','System',1,'2026-01-26T02:12:05.195Z','{"welcomeId":"08f381fe-08e0-49bc-8f8a-e7558be5e83a"}');
INSERT INTO notifications VALUES(7,'Welcome to Dugtong','Thank you for registering as a donor. Keep your availability updated.','System',1,'2026-01-26T02:12:05.747Z','{"welcomeId":"b1879fd1-9bbe-4314-a101-349d64701b39"}');
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  is_closed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);
INSERT INTO messages VALUES(1,2,'Donor Inquiry','Available for emergency donation this week.',0,0,'2026-02-03T02:12:01.310Z',NULL);
INSERT INTO messages VALUES(2,3,'Donor Inquiry','I have a friend with O- willing to donate.',0,0,'2026-02-05T02:12:01.617Z',NULL);
INSERT INTO messages VALUES(3,4,'Donor Inquiry','Available for emergency donation this week.',0,0,'2026-02-08T02:12:01.925Z',NULL);
INSERT INTO messages VALUES(4,5,'Donor Inquiry','How do I update my availability status?',0,0,'2026-02-07T02:12:02.232Z',NULL);
INSERT INTO messages VALUES(5,6,'Donor Inquiry','I have a friend with O- willing to donate.',0,0,'2026-01-30T02:12:02.539Z',NULL);
INSERT INTO messages VALUES(6,7,'Donor Inquiry','Available for emergency donation this week.',0,0,'2026-02-05T02:12:02.846Z',NULL);
CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donor_id INTEGER,
  donation_date TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  location TEXT NOT NULL,
  FOREIGN KEY (donor_id) REFERENCES donors(id)
);
CREATE TABLE IF NOT EXISTS blood_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_name TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  urgency TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',42);
INSERT INTO sqlite_sequence VALUES('donor_registrations',48);
INSERT INTO sqlite_sequence VALUES('donor_profiles',20);
INSERT INTO sqlite_sequence VALUES('donors',22);
INSERT INTO sqlite_sequence VALUES('messages',6);
INSERT INTO sqlite_sequence VALUES('alerts',7);
INSERT INTO sqlite_sequence VALUES('notifications',7);
CREATE UNIQUE INDEX idx_users_contact_number ON users(contact_number);
COMMIT;
