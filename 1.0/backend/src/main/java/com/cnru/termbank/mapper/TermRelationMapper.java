package com.cnru.termbank.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cnru.termbank.entity.TermRelation;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

public interface TermRelationMapper extends BaseMapper<TermRelation> {

    @Select("SELECT r.id, r.relationType, t.id AS termId, t.cnTerm, t.ruTerm, t.dbId" +
            " FROM term_relations r JOIN terms t ON t.id = r.relatedTermId WHERE r.termId = #{termId}")
    List<Map<String, Object>> listRelated(@Param("termId") Long termId);
}
