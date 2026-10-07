package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 术语条目 */
@Data
@TableName("terms")
public class Term {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long dbId;
    private String cnTerm;
    private String ruTerm;
    private String enTerm;
    private String definition;
    private String context;
    private String cultureNote;
    private String pos;
    private String tags;
    private String status;
    private Integer version;
    private Long createdBy;
    private Long updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField(exist = false)
    private String dbName;
}
