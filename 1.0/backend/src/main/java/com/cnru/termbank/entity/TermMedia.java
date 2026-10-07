package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 术语富媒体 */
@Data
@TableName("term_media")
public class TermMedia {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long termId;
    private String type;
    private String url;
    private String description;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
