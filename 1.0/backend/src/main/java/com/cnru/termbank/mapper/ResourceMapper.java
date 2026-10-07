package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.Resource;
import org.apache.ibatis.annotations.Select;

public interface ResourceMapper extends BaseMapper<Resource> {

    @Select("SELECT COUNT(*) FROM resources WHERE status='active'")
    long countActive();
}
