package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 用户-分库角色 */
@Data
@TableName("user_database_roles")
public class UserDatabaseRole {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long dbId;
    private String role;
    private LocalDateTime createdAt;
}
