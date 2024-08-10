// Unit tests for: create

import { Body, ResponseType } from "@tauri-apps/api/http";

import { CrudService } from "../crud.service";

class MockResponse {
  status: number = 200;
  data: any = {};
}

class MockErrorResponse {
  errorMessage: string = "An error occurred";
}

const mockFetch = jest.fn();
const mockMessage = jest.fn();

jest.mock("@tauri-apps/api/http", () => ({
  fetch: mockFetch,
  Body: {
    json: jest.fn((data) => data),
  },
  ResponseType: {
    JSON: 1,
    Text: 2,
    Binary: 3,
  },
}));

jest.mock("@tauri-apps/api/dialog", () => ({
  message: mockMessage,
}));
describe("CrudService.create() create method", () => {
  let service: CrudService<any>;

  beforeEach(() => {
    service = new CrudService<any>();
    service["documentName"] = "testDocument";
    jest.clearAllMocks();
  });

  describe("Happy path", () => {
    it("should successfully create a new record", async () => {
      // Arrange
      const mockResponse = new MockResponse();
      mockResponse.status = 200;
      mockFetch.mockResolvedValue(mockResponse as any as never);

      const model = { name: "Test" };

      // Act
      await service.create(model);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "https://financeiro-34ba.restdb.io/rest/testDocument",
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: Body.json(model),
          headers: service["getHeaders"](),
        }
      );
      expect(mockMessage).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle non-200 response status", async () => {
      // Arrange
      const mockErrorResponse = new MockErrorResponse();
      const mockResponse = new MockResponse();
      mockResponse.status = 400;
      mockResponse.data = mockErrorResponse;
      mockFetch.mockResolvedValue(mockResponse as any as never);

      const model = { name: "Test" };

      // Act
      await service.create(model);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "https://financeiro-34ba.restdb.io/rest/testDocument",
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: Body.json(model),
          headers: service["getHeaders"](),
        }
      );
      expect(mockMessage).toHaveBeenCalledWith(mockErrorResponse.errorMessage, {
        type: "error",
      });
    });

    it("should handle fetch rejection", async () => {
      // Arrange
      const mockError = new Error("Network error");
      mockFetch.mockRejectedValue(mockError as never);

      const model = { name: "Test" };

      // Act & Assert
      await expect(service.create(model)).rejects.toThrow("Network error");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://financeiro-34ba.restdb.io/rest/testDocument",
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: Body.json(model),
          headers: service["getHeaders"](),
        }
      );
      expect(mockMessage).not.toHaveBeenCalled();
    });
  });
});

// End of unit tests for: create
