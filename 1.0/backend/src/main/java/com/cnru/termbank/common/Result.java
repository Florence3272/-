package com.cnru.termbank.common;

import lombok.Data;

import java.io.Serializable;

/** 统一响应体 */
@Data
public class Result<T> implements Serializable {
    private boolean success;
    private String message;
    private T data;

    public Result() {}

    public Result(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public static <T> Result<T> ok() { return new Result<>(true, "ok", null); }

    public static <T> Result<T> ok(T data) { return new Result<>(true, "ok", data); }

    public static <T> Result<T> ok(T data, String message) { return new Result<>(true, message, data); }

    public static <T> Result<T> fail(String message) { return new Result<>(false, message, null); }
}
