package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    @JsonIgnore
    private String passwordHash;
    private String name;
    private String email;
    private String phone;
    private String avatar;
    private String bio;
    private String role;
    private String status;
    private LocalDateTime lastSignInAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
