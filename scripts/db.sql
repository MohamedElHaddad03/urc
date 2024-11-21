CREATE TABLE users (
   user_id serial PRIMARY KEY,
   username VARCHAR ( 50 ) UNIQUE NOT NULL,
   password VARCHAR ( 100 ) NOT NULL,
   email VARCHAR ( 255 ) UNIQUE NOT NULL,
   created_on TIMESTAMP NOT NULL,
   last_login TIMESTAMP,
   external_id VARCHAR ( 50 ) UNIQUE NOT NULL
);

CREATE TABLE MESSAGE (
   ID serial PRIMARY KEY,
    USER_ID1 INT,            
    USER_ID2 INT,           
    CONTENT TEXT,            
    SENT_AT TIMESTAMP,      
    
    
    FOREIGN KEY (USER_ID1) REFERENCES USERS(USER_ID),
    FOREIGN KEY (USER_ID2) REFERENCES USERS(USER_ID)
);


CREATE TABLE rooms (
   room_id serial PRIMARY KEY,
   name VARCHAR ( 50 ) UNIQUE NOT NULL,
   created_on TIMESTAMP NOT NULL,
   created_by INTEGER NOT NULL
);

CREATE TABLE roomsMessages (
   room_message_id serial PRIMARY KEY,
   SENDER_ID INT NOT NULL,  
   room_id INT NOT NULL,         
   CONTENT TEXT NOT NULL,            
   SENT_AT TIMESTAMP,

   FOREIGN KEY (SENDER_ID) REFERENCES USERS(USER_ID)
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)

);


insert into users (username, password, email, created_on, external_id) values ('test', 'gcrjEewWyAuYskG3dd6gFTqsC6/SKRsbTZ+g1XHDO10=', 'test@univ-brest.fr', now(), 'ac7a25a9-bcc5-4fba-8a3d-d42acda26949');

insert into rooms (name, created_on, created_by) values ('General', now(), 4);
insert into rooms (name, created_on, created_by) values ('News', now(), 4);
insert into rooms (name, created_on, created_by) values ('Random', now(), 4);