def fib(n):
    nums = [0, 1]
    for i in range(2, n):
        a = nums[i-1]
        b = nums[i-2]
        nums.append(a + b)
    return nums

print(fib(10))
