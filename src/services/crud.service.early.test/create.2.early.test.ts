// Unit tests for: create

import { ResponseType } from "@tauri-apps/api/http";

import { CrudService } from "../crud.service";

// Mock for @tauri-apps/api/dialog
const mockMessage = jest.fn();

// Mock for @tauri-apps/api/http
const mockFetch = jest.fn();
const mockBody = {
  json: jest.fn(),
};

// Mock for ErrorResponse
class MockErrorResponse {
  public errorMessage: string = "Error occurred";
}

// Mock for the model
class MockModel {
  public Description: string = "Test Description";
}

// Mock for the CrudService
class MockCrudService extends CrudService<MockModel> {
  constructor() {
    super();
    this.documentName = "testDocument";
  }
}

jest.mock("@tauri-apps/api/dialog", () => ({
  message: jest.fn(),
}));

jest.mock("@tauri-apps/api/http", () => ({
  fetch: jest.fn(),
  Body: {
    json: jest.fn(),
  },
  ResponseType: {
    JSON: 1,
    Text: 2,
    Binary: 3,
  },
}));

describe("CrudService.create() create method", () => {
  let service: MockCrudService;
  let mockModel: MockModel;

  beforeEach(() => {
    service = new MockCrudService() as any;
    mockModel = new MockModel() as any;
    jest.clearAllMocks();
  });

  describe("Happy Path", () => {
    it("should successfully create a model", async () => {
      // Arrange
      (mockFetch as any).mockResolvedValue({
        status: 200,
        data: {},
      });

      // Act
      await service.create(mockModel as any);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `https://financeiro-34ba.restdb.io/rest/${service.documentName}`,
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: mockBody.json(mockModel),
          headers: service.getHeaders(),
        }
      );
      expect(mockMessage).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle non-200 response status", async () => {
      // Arrange
      const mockErrorResponse = new MockErrorResponse() as any;
      (mockFetch as any).mockResolvedValue({
        status: 400,
        data: mockErrorResponse,
      });

      // Act
      await service.create(mockModel as any);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `https://financeiro-34ba.restdb.io/rest/${service.documentName}`,
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: mockBody.json(mockModel),
          headers: service.getHeaders(),
        }
      );
      expect(mockMessage).toHaveBeenCalledWith(mockErrorResponse.errorMessage, {
        type: "error",
      });
    });

    it("should handle fetch rejection", async () => {
      // Arrange
      const mockError = new Error("Network Error");
      (mockFetch as any).mockRejectedValue(mockError);

      // Act
      await expect(service.create(mockModel as any)).rejects.toThrow(
        "Network Error"
      );

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `https://financeiro-34ba.restdb.io/rest/${service.documentName}`,
        {
          method: "POST",
          timeout: 30,
          responseType: ResponseType.JSON,
          body: mockBody.json(mockModel),
          headers: service.getHeaders(),
        }
      );
      expect(mockMessage).not.toHaveBeenCalled();
    });

    it("should handle missing documentName", async () => {
      // Arrange
      service.documentName = undefined;

      // Act
      await expect(service.create(mockModel as any)).rejects.toThrow(
        "Cannot read property 'documentName' of undefined"
      );

      // Assert
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockMessage).not.toHaveBeenCalled();
    });
  });
});

// End of unit tests for: create
