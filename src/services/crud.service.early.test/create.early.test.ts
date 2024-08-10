// Unit tests for: create

import { message } from "@tauri-apps/api/dialog";

import { Body, ResponseType, fetch } from "@tauri-apps/api/http";

import { CrudService } from "../crud.service";

// Mock classes
class MockResponse {
  status: number = 200;
  data: any = {};
}

class MockErrorResponse {
  errorMessage: string = "Error occurred";
}

describe("CrudService.create() create method", () => {
  let crudService: CrudService<any>;
  let mockResponse: MockResponse;
  let mockErrorResponse: MockErrorResponse;

  beforeEach(() => {
    crudService = new CrudService<any>();
    crudService.documentName = "testDocument";
    mockResponse = new MockResponse();
    mockErrorResponse = new MockErrorResponse();
  });

  describe("Happy Path", () => {
    it("should successfully create a model", async () => {
      // Arrange
      const model = { name: "Test Model" };
      jest
        .spyOn(fetch, "fetch")
        .mockResolvedValue(mockResponse as any as never);

      // Act
      await crudService.create(model);

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        `https://financeiro-34ba.restdb.io/rest/${crudService.documentName}`,
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: Body.json(model),
          headers: {
            "cache-control": "no-cache",
            "x-apikey": "16f4f12edab2c3a60669903c71317eb1a20cf",
            "content-type": "application/json",
          },
        }
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle non-200 response status", async () => {
      // Arrange
      const model = { name: "Test Model" };
      mockResponse.status = 400;
      mockResponse.data = mockErrorResponse;
      jest
        .spyOn(fetch, "fetch")
        .mockResolvedValue(mockResponse as any as never);
      jest.spyOn(message, "message").mockResolvedValue(undefined as never);

      // Act
      await crudService.create(model);

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        `https://financeiro-34ba.restdb.io/rest/${crudService.documentName}`,
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: Body.json(model),
          headers: {
            "cache-control": "no-cache",
            "x-apikey": "16f4f12edab2c3a60669903c71317eb1a20cf",
            "content-type": "application/json",
          },
        }
      );
      expect(message).toHaveBeenCalledWith(mockErrorResponse.errorMessage, {
        type: "error",
      });
    });

    it("should handle network errors gracefully", async () => {
      // Arrange
      const model = { name: "Test Model" };
      jest
        .spyOn(fetch, "fetch")
        .mockRejectedValue(new Error("Network Error") as never);
      jest.spyOn(message, "message").mockResolvedValue(undefined as never);

      // Act
      await crudService.create(model);

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        `https://financeiro-34ba.restdb.io/rest/${crudService.documentName}`,
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: Body.json(model),
          headers: {
            "cache-control": "no-cache",
            "x-apikey": "16f4f12edab2c3a60669903c71317eb1a20cf",
            "content-type": "application/json",
          },
        }
      );
      expect(message).toHaveBeenCalledWith("Network Error", { type: "error" });
    });

    it("should handle undefined documentName", async () => {
      // Arrange
      const model = { name: "Test Model" };
      crudService.documentName = undefined;
      jest
        .spyOn(fetch, "fetch")
        .mockResolvedValue(mockResponse as any as never);

      // Act
      await crudService.create(model);

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        `https://financeiro-34ba.restdb.io/rest/undefined`,
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: Body.json(model),
          headers: {
            "cache-control": "no-cache",
            "x-apikey": "16f4f12edab2c3a60669903c71317eb1a20cf",
            "content-type": "application/json",
          },
        }
      );
    });
  });
});

// End of unit tests for: create
