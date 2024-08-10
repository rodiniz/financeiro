CREATE TABLE category (
  _id TEXT(21) PRIMARY KEY NOT NULL,
  description TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_category ON category(description);

CREATE TABLE user(
   _id TEXT(21) PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expense (
  _id TEXT(21) PRIMARY KEY NOT NULL,
  description TEXT NOT NULL,
  amount number,
  date TEXT,
  userId TEXT,
  categoryId TEXT,
  FOREIGN KEY (userId) REFERENCES user(_id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES category(_id) ON DELETE CASCADE
);