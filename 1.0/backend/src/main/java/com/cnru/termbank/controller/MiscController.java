package com.cnru.termbank.controller;

import com.cnru.termbank.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class MiscController {

    @GetMapping("/health")
    public Result<Map<String, Object>> health() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("status", "up");
        out.put("time", LocalDateTime.now());
        return Result.ok(out);
    }

    @GetMapping("/ping")
    public Result<Map<String, Object>> ping() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("ok", true);
        out.put("ts", System.currentTimeMillis());
        return Result.ok(out);
    }
}
