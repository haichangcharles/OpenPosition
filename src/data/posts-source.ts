export const DATA_UNAVAILABLE_MESSAGE =
  "Current opportunity data is temporarily unavailable. OpenPosition is running on a free database plan, so the database may pause after inactivity. Please refresh again in a few minutes.";

type ResolvePostsDataInput<T> = {
  queryData: T[] | undefined;
  mockData: T[];
  isQueryError: boolean;
  isDevelopment: boolean;
  enableMockFallback: boolean;
};

export function resolvePostsData<T>({
  queryData,
  mockData,
  isQueryError,
  isDevelopment,
  enableMockFallback,
}: ResolvePostsDataInput<T>) {
  if (queryData) {
    return {
      data: queryData,
      isUsingMockFallback: false,
      isUnavailable: false,
    };
  }

  const canUseMockFallback = isDevelopment || enableMockFallback;
  if (isQueryError && canUseMockFallback) {
    return {
      data: mockData,
      isUsingMockFallback: true,
      isUnavailable: false,
    };
  }

  if (isQueryError) {
    return {
      data: [] as T[],
      isUsingMockFallback: false,
      isUnavailable: true,
    };
  }

  return {
    data: mockData,
    isUsingMockFallback: true,
    isUnavailable: false,
  };
}
