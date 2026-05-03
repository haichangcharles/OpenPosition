import { describe, expect, test } from "vitest";
import { resolvePostsData } from "./posts-source.js";

const mockPosts = [{ id: 1, title: "Mock post" }];
const livePosts = [{ id: 2, title: "Live post" }];

describe("post source resolution", () => {
  test("uses live query data when it is available", () => {
    expect(
      resolvePostsData({
        queryData: livePosts,
        mockData: mockPosts,
        isQueryError: false,
        isDevelopment: false,
        enableMockFallback: false,
      }),
    ).toEqual({
      data: livePosts,
      isUsingMockFallback: false,
      isUnavailable: false,
    });
  });

  test("does not fall back to mock data in production when the API fails", () => {
    expect(
      resolvePostsData({
        queryData: undefined,
        mockData: mockPosts,
        isQueryError: true,
        isDevelopment: false,
        enableMockFallback: false,
      }),
    ).toEqual({
      data: [],
      isUsingMockFallback: false,
      isUnavailable: true,
    });
  });

  test("keeps mock fallback available during development", () => {
    expect(
      resolvePostsData({
        queryData: undefined,
        mockData: mockPosts,
        isQueryError: true,
        isDevelopment: true,
        enableMockFallback: false,
      }),
    ).toEqual({
      data: mockPosts,
      isUsingMockFallback: true,
      isUnavailable: false,
    });
  });
});
