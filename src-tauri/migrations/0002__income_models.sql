CREATE TABLE income (
  _id TEXT(21) PRIMARY KEY NOT NULL, 
  amount number,
  date TEXT,
  userId TEXT,
  FOREIGN KEY (userId) REFERENCES user(_id) ON DELETE CASCADE 
);