import * as algorithms from "./algorithm.js";
jest.mock("crypto");
describe("BCrypt", () => {
    it("Creates hash correctly", () => {
        expect(algorithms.BCrypt.hash("Some Password :p")).toBe("$2a$14$fffffffffffffffffffffeBA82xE34ZvqTbxYevnHLU1p2XHqGPvC");
    })
    it("Creates hash with specified cost", () => {
        expect(algorithms.BCrypt.hash("Some Password :p", 10)).toBe("$2a$10$fffffffffffffffffffffeGiNiaU8gK0Rt8s53duHOC4WMRrH2eJa");
    })
    it("Validates password correctly", () => {
        let hash = algorithms.BCrypt.hash("Some Password :p");
        expect(algorithms.BCrypt.isValid("Some Password :p", hash)).toBe(true);
        expect(algorithms.BCrypt.isValid("Some Puss :p", hash)).toBe(false);
    })
})