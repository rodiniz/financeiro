// Unit tests for: ngOnInit

import { Router } from "@angular/router";

import { CategoryService } from "../../../../services/category.service";

import { CategoryEditComponent } from "../category-edit.component";

import { TestBed } from "@angular/core/testing";

describe("CategoryEditComponent.ngOnInit() ngOnInit method", () => {
  let component: CategoryEditComponent;
  let categoryServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    categoryServiceMock = {
      getById: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CategoryEditComponent,
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    component = TestBed.inject(CategoryEditComponent);
  });

  describe("Happy Path", () => {
    it("should set the description if id is provided and valid", async () => {
      // Arrange
      const category = { description: "Test Description" };
      categoryServiceMock.getById.mockResolvedValue(category);
      component.id = "123";

      // Act
      await component.ngOnInit();

      // Assert
      expect(categoryServiceMock.getById).toHaveBeenCalledWith("123");
      expect(component.description.value).toBe("Test Description");
    });
  });

  describe("Edge Cases", () => {
    it("should not set the description if id is not provided", async () => {
      // Arrange
      component.id = "";

      // Act
      await component.ngOnInit();

      // Assert
      expect(categoryServiceMock.getById).not.toHaveBeenCalled();
      expect(component.description.value).toBe("");
    });

    it("should not set the description if id is an empty string", async () => {
      // Arrange
      component.id = "";

      // Act
      await component.ngOnInit();

      // Assert
      expect(categoryServiceMock.getById).not.toHaveBeenCalled();
      expect(component.description.value).toBe("");
    });

    it("should handle the case when categoryService.getById throws an error", async () => {
      // Arrange
      categoryServiceMock.getById.mockRejectedValue(new Error("Service Error"));
      component.id = "123";

      // Act
      await component.ngOnInit();

      // Assert
      expect(categoryServiceMock.getById).toHaveBeenCalledWith("123");
      expect(component.description.value).toBe("");
    });
  });
});

// End of unit tests for: ngOnInit
