import React, { useState } from 'react';

const QueryConfigurator = ({ availableFields }) => {
    const [groupByFields, setGroupByFields] = useState([]);
    const [havingConditions, setHavingConditions] = useState([]);
    const [orderByFields, setOrderByFields] = useState([]);

    const handleAddGroupBy = () => {
        setGroupByFields([...groupByFields, '']);
    };

    const handleAddHaving = () => {
        setHavingConditions([...havingConditions, { field: '', operator: '', value: '' }]);
    };

    const handleAddOrderBy = () => {
        setOrderByFields([...orderByFields, { field: '', order: 'ASC' }]);
    };

    const handleGroupByChange = (index, value) => {
        const updated = [...groupByFields];
        updated[index] = value;
        setGroupByFields(updated);
    };

    const handleHavingChange = (index, key, value) => {
        const updated = [...havingConditions];
        updated[index][key] = value;
        setHavingConditions(updated);
    };

    const handleOrderByChange = (index, key, value) => {
        const updated = [...orderByFields];
        updated[index][key] = value;
        setOrderByFields(updated);
    };

    const handleRemoveGroupBy = (index) => {
        const updated = [...groupByFields];
        updated.splice(index, 1);
        setGroupByFields(updated);
    };

    const handleRemoveHaving = (index) => {
        const updated = [...havingConditions];
        updated.splice(index, 1);
        setHavingConditions(updated);
    };

    const handleRemoveOrderBy = (index) => {
        const updated = [...orderByFields];
        updated.splice(index, 1);
        setOrderByFields(updated);
    };

    return (
        <div className="query-configurator">
            <h2>GROUP BY</h2>
            {groupByFields.map((field, index) => (
                <div key={index} className="field-row">
                    <select
                        value={field}
                        onChange={(e) => handleGroupByChange(index, e.target.value)}
                    >
                        <option value="">Выберите поле</option>
                        {availableFields.map((availableField) => (
                            <option key={availableField} value={availableField}>
                                {availableField}
                            </option>
                        ))}
                    </select>
                    <button onClick={() => handleRemoveGroupBy(index)}>Удалить</button>
                </div>
            ))}
            <button onClick={handleAddGroupBy}>Добавить GROUP BY</button>

            <h2>HAVING</h2>
            {havingConditions.map((condition, index) => (
                <div key={index} className="field-row">
                    <select
                        value={condition.field}
                        onChange={(e) => handleHavingChange(index, 'field', e.target.value)}
                    >
                        <option value="">Выберите поле</option>
                        {availableFields.map((availableField) => (
                            <option key={availableField} value={availableField}>
                                {availableField}
                            </option>
                        ))}
                    </select>
                    <select
                        value={condition.operator}
                        onChange={(e) => handleHavingChange(index, 'operator', e.target.value)}
                    >
                        <option value="">Оператор</option>
                        <option value="=">=</option>
                        <option value=">">{'>'}</option>
                        <option value="<">{'<'}</option>
                        <option value=">=">{'>='}</option>
                        <option value="<=">{'<='}</option>
                        <option value="<>">{'<>'}</option>
                    </select>
                    <input
                        type="text"
                        value={condition.value}
                        placeholder="Значение"
                        onChange={(e) => handleHavingChange(index, 'value', e.target.value)}
                    />
                    <button onClick={() => handleRemoveHaving(index)}>Удалить</button>
                </div>
            ))}
            <button onClick={handleAddHaving}>Добавить HAVING</button>

            <h2>ORDER BY</h2>
            {orderByFields.map((order, index) => (
                <div key={index} className="field-row">
                    <select
                        value={order.field}
                        onChange={(e) => handleOrderByChange(index, 'field', e.target.value)}
                    >
                        <option value="">Выберите поле</option>
                        {availableFields.map((availableField) => (
                            <option key={availableField} value={availableField}>
                                {availableField}
                            </option>
                        ))}
                    </select>
                    <select
                        value={order.order}
                        onChange={(e) => handleOrderByChange(index, 'order', e.target.value)}
                    >
                        <option value="ASC">ASC</option>
                        <option value="DESC">DESC</option>
                    </select>
                    <button onClick={() => handleRemoveOrderBy(index)}>Удалить</button>
                </div>
            ))}
            <button onClick={handleAddOrderBy}>Добавить ORDER BY</button>
        </div>
    );
};

export default QueryConfigurator;
