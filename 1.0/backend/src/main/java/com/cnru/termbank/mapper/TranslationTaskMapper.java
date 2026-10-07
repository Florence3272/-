package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.TranslationTask;
import org.apache.ibatis.annotations.Select;

public interface TranslationTaskMapper extends BaseMapper<TranslationTask> {

    @Select("SELECT COUNT(*) FROM translation_tasks")
    long countAll();
}
