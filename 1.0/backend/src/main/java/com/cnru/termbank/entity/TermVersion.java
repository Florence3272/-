package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 术语版本历史 */
@Data
@TableName("term_versions")
public class TermVersion {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long termId;
    private Integer version;
    private String snapshot;
    private String changeType;
    private Long changedBy;
    private String changeNote;
    private LocalDateTime createdAt;
}
