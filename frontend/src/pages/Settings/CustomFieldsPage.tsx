import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button, Card, Empty, message, Segmented, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import {
  addField,
  deleteField,
  fetchCustomFields,
  reorderFields,
  selectCustomFields,
  selectCustomFieldsTimestamp,
  updateField,
} from '../../features/customFields/customFieldsSlice';
import type { CustomField, CreateCustomFieldPayload } from '../../api/customFieldsApi';
import CustomFieldModal from './CustomFieldModal';

const ENTITIES = ['Lead', 'Opportunity', 'Customer', 'Product'];
const STALE_MS = 1000 * 60 * 5;

const DroppableTableBody: React.FC<any> = (props) => (
  <Droppable droppableId="custom-fields-droppable">
    {(provided) => (
      <tbody ref={provided.innerRef} {...provided.droppableProps} {...props}>
        {props.children}
        {provided.placeholder}
      </tbody>
    )}
  </Droppable>
);

const DraggableTableRow: React.FC<any> = ({ index, className, style, ...rest }) => {
  const rowKey = rest['data-row-key'];
  return (
    <Draggable draggableId={String(rowKey)} index={index}>
      {(provided) => (
        <tr
          {...rest}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`cursor-move ${className || ''}`}
          style={{ ...style, ...provided.draggableProps.style }}
        />
      )}
    </Draggable>
  );
};

const CustomFieldsPage = () => {
  const dispatch = useAppDispatch();
  const [selectedEntity, setSelectedEntity] = useState<string>('Lead');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [loading, setLoading] = useState(false);

  const fields = useAppSelector(selectCustomFields(selectedEntity));
  const lastFetchedAt = useAppSelector(selectCustomFieldsTimestamp(selectedEntity));
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'Admin');

  useEffect(() => {
    if (!isAdmin) return;
    const shouldFetch = !lastFetchedAt || Date.now() - lastFetchedAt > STALE_MS;
    if (shouldFetch) {
      dispatch(fetchCustomFields(selectedEntity)).catch(() => {
        message.error('Failed to load custom fields');
      });
    }
  }, [dispatch, selectedEntity, lastFetchedAt, isAdmin]);

  const groupedData = useMemo(() => {
    return [...fields].sort(
      (a, b) => (a.group || '').localeCompare(b.group || '') || a.order - b.order
    );
  }, [fields]);

  const handleAddField = () => {
    setEditingField(null);
    setModalOpen(true);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setModalOpen(true);
  };

  const handleDeleteField = async (field: CustomField) => {
    try {
      await dispatch(deleteField({ id: field.id, entity: selectedEntity })).unwrap();
      message.success('Field deleted');
    } catch (error: any) {
      message.error(error?.message || 'Failed to delete field');
    }
  };

  const handleReorder = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const newOrder = Array.from(groupedData);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);

    const payload = newOrder.map((field, index) => ({
      id: field.id,
      order: index,
      group: field.group ?? null,
    }));

    try {
      await dispatch(reorderFields({ entity: selectedEntity, updates: payload })).unwrap();
      message.success('Order updated');
    } catch (error: any) {
      message.error(error?.message || 'Failed to reorder fields');
    }
  };

  const handleModalSubmit = async (values: CreateCustomFieldPayload) => {
    setLoading(true);
    try {
      if (editingField) {
        await dispatch(updateField({ id: editingField.id, data: values })).unwrap();
        message.success('Field updated');
      } else {
        await dispatch(addField(values)).unwrap();
        message.success('Field created');
      }
      setModalOpen(false);
    } catch (error: any) {
      message.error(error?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<CustomField> = [
    {
      title: 'Order',
      dataIndex: 'order',
      width: 80,
    },
    {
      title: 'Label',
      dataIndex: 'label',
    },
    {
      title: 'Key',
      dataIndex: 'key',
    },
    {
      title: 'Type',
      dataIndex: 'fieldType',
    },
    {
      title: 'Required',
      dataIndex: 'required',
      render: (value) => (value ? 'Yes' : 'No'),
      width: 100,
    },
    {
      title: 'Group',
      dataIndex: 'group',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditField(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteField(record)} />
        </Space>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <Card>
        <Empty description="This section is available to administrators only." />
      </Card>
    );
  }

  return (
    <Card title="Custom Fields">
      <Space style={{ marginBottom: 16 }}>
        <Segmented options={ENTITIES} value={selectedEntity} onChange={(val) => setSelectedEntity(val as string)} />
        <Button icon={<PlusOutlined />} type="primary" onClick={handleAddField}>
          Add field
        </Button>
      </Space>

      <DragDropContext onDragEnd={handleReorder}>
        <Table
          rowKey="id"
          dataSource={groupedData}
          columns={columns}
          pagination={false}
          locale={{ emptyText: 'No custom fields configured yet.' }}
          components={{
            body: {
              wrapper: DroppableTableBody,
              row: DraggableTableRow,
            },
          }}
          onRow={(_, index) => ({ index })}
        />
      </DragDropContext>

      <CustomFieldModal
        open={modalOpen}
        entity={selectedEntity}
        initialValues={editingField}
        onSubmit={handleModalSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
      />
    </Card>
  );
};

export default CustomFieldsPage;
