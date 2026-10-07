package com.cnru.termbank.common;

/** 业务异常，统一由 GlobalExceptionHandler 转为 JSON */
public class ApiException extends RuntimeException {
    private final int status;

    public ApiException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() { return status; }

    public static ApiException badRequest(String msg) { return new ApiException(400, msg); }
    public static ApiException unauthorized(String msg) { return new ApiException(401, msg); }
    public static ApiException forbidden(String msg) { return new ApiException(403, msg); }
    public static ApiException notFound(String msg) { return new ApiException(404, msg); }
    public static ApiException conflict(String msg) { return new ApiException(409, msg); }
}
