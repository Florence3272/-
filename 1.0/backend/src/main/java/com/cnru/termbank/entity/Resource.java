package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 教学资源 */
@Data
@TableName("resources")
public class Resource {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long dbId;
    private String moduleType;
    private String title;
    private String content;
    private String coverUrl;
    private String mediaUrl;
    private String difficulty;
    private Integer duration;
    private String status;
    private Long creatorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
