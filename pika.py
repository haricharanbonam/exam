def solve():
    N = int(input())
    X = int(input())
    Y = int(input())
    M = int(input())

    # Generate all (i, j) pairs in order
    pairs = []
    for i in range(N):
        for j in range(i + 1, N):
            pairs.append((i, j))

    D = [[0] * N for _ in range(N)]
    XY_mod = (X * Y) % M

    for idx, (i, j) in enumerate(pairs):
        if idx == 0:
            D[i][j] = 1
        else:
            prev_i, prev_j = pairs[idx - 1]
            D[i][j] = (D[prev_i][prev_j] + XY_mod) % M
        D[j][i] = D[i][j]

    # Bitmask DP to choose disjoint pairs
    dp = [-1] * (1 << N)
    dp[0] = 0

    for mask in range(1 << N):
        if dp[mask] == -1:
            continue
        for i in range(N):
            if (mask & (1 << i)) == 0:
                for j in range(i + 1, N):
                    if (mask & (1 << j)) == 0:
                        new_mask = mask | (1 << i) | (1 << j)
                        dp[new_mask] = max(dp[new_mask], dp[mask] + D[i][j])
                break  # pair i only once

    print(max(dp))

solve()
