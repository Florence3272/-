package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 分数据库 */
@Data
@TableName("`databases`")
public class TermDatabase {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String category;
    private String description;
    private Long ownerId;
    private String visibility;
    private Integer termCount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 非表字段：库主名（查询时填充） */
    @TableField(exist = false)
    private String ownerName;
    @TableField(exist = false)
    private String ownerUsername;
    @TableField(exist = false)
    private Long memberCount;
}
