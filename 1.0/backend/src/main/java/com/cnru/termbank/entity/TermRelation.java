package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 术语关联 */
@Data
@TableName("term_relations")
public class TermRelation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long termId;
    private Long relatedTermId;
    private String relationType;
    private LocalDateTime createdAt;
}
