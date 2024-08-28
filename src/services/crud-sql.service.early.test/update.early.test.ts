// Unit tests for: update

import { message } from "@tauri-apps/api/dialog";

import { CrudSqlService } from "../crud-sql.service";

// Mocking the Database class
class MockDatabase {
  public execute = jest.fn();
}

// Concrete implementation of the abstract CrudSqlService class
class ConcreteCrudSqlService extends CrudSqlService<any> {
  constructor() {
    super();
    this.documentName = "test_table";
  }
}

describe("CrudSqlService.update() update method", () => {
  let service: ConcreteCrudSqlService;
  let mockDatabase: MockDatabase;

  beforeEach(() => {
    mockDatabase = new MockDatabase() as any;
    service = new ConcreteCrudSqlService();
    service["db"] = mockDatabase as any;
  });

  describe("Happy path", () => {
    it("should update the record successfully when valid id and model are provided", async () => {
      // Arrange
      const id = "123";
      const model = { name: "Test", age: 30 };
      mockDatabase.execute.mockResolvedValue({ rowsAffected: 1 } as any);

      // Act
      await service.update(id, model);

      // Assert
      expect(mockDatabase.execute).toHaveBeenCalledWith(
        "UPDATE test_table SET name = $1, age = $2 WHERE _id = $3",
        ["Test", 30, "123"]
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle the case when no rows are affected", async () => {
      // Arrange
      const id = "123";
      const model = { name: "Test", age: 30 };
      mockDatabase.execute.mockResolvedValue({ rowsAffected: 0 } as any);
      const messageSpy = jest.spyOn(message, "default").mockResolvedValue();

      // Act
      await service.update(id, model);

      // Assert
      expect(messageSpy).toHaveBeenCalledWith(
        JSON.stringify({ rowsAffected: 0 }),
        { type: "error" }
      );
    });

    it("should handle the case when the model is empty", async () => {
      // Arrange
      const id = "123";
      const model = {};
      mockDatabase.execute.mockResolvedValue({ rowsAffected: 1 } as any);

      // Act
      await service.update(id, model);

      // Assert
      expect(mockDatabase.execute).toHaveBeenCalledWith(
        "UPDATE test_table SET  WHERE _id = $1",
        ["123"]
      );
    });

    it("should handle SQL execution errors gracefully", async () => {
      // Arrange
      const id = "123";
      const model = { name: "Test", age: 30 };
      mockDatabase.execute.mockRejectedValue(new Error("SQL Error") as never);
      const messageSpy = jest.spyOn(message, "default").mockResolvedValue();

      // Act & Assert
      await expect(service.update(id, model)).rejects.toThrow("SQL Error");
      expect(messageSpy).not.toHaveBeenCalled();
    });
  });
});

// End of unit tests for: update
