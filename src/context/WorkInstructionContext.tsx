import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { generateDynamicERPData } from '../data/dynamicERPData';
import { useCustomers } from './CustomerContext';

interface WorkInstruction {
  id: string;
  instructionNumber: string;
  productName: string;
  productCode: string;
  bomId: string;
  quantity: number;
  unit: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "pending" | "in_progress" | "paused" | "completed" | "cancelled";
  assignedWorker: string;
  workStation: string;
  estimatedTime: number; // minutes
  actualTime?: number;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  instructions: string;
  notes?: string;
  qualityCheck: boolean;
  materials: {
    name: string;
    quantity: number;
    unit: string;
    available: number;
  }[];
  customerName?: string;
  orderAmount?: number;
}

interface WorkInstructionContextType {
  workInstructions: WorkInstruction[];
  addWorkInstruction: (instruction: Omit<WorkInstruction, 'id' | 'instructionNumber'>) => void;
  updateWorkInstruction: (id: string, updates: Partial<WorkInstruction>) => void;
  deleteWorkInstruction: (id: string) => void;
  getWorkInstructionById: (id: string) => WorkInstruction | undefined;
}

const WorkInstructionContext = createContext<WorkInstructionContextType | undefined>(undefined);

// Generate work instructions from dynamic ERP data
const generateWorkInstructionsFromERPData = (dynamicERPData: any): WorkInstruction[] => {
  const { productionOrders, salesOrders, customers } = dynamicERPData;
  
  return productionOrders.map((order: any, index: number) => {
    const salesOrder = salesOrders.find((so: any) => so.id === order.salesOrderId);
    const customer = salesOrder ? customers.find((c: any) => c.id === salesOrder.customerId) : null;
    
    // Helper function for consistent seeded random values
    const seededRandom = (seed: string, min: number = 0, max: number = 1): number => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      const normalized = Math.abs(hash) / 2147483647;
      return min + (normalized * (max - min));
    };
    
    const statusMap: { [key: string]: WorkInstruction['status'] } = {
      '계획': 'pending',
      '진행중': 'in_progress', 
      '완료': 'completed',
      '지연': 'paused'
    };
    
    const priorityMap: { [key: string]: WorkInstruction['priority'] } = {
      '높음': 'high',
      '보통': 'normal',
      '낮음': 'low'
    };
    
    const workers = ['김기술', '이제조', '박전기', '최기계', '정센서', '한조립', '송품질', '류테스트'];
    const workStations = ['조립라인 A', '조립라인 B', '조립라인 C', '테스트 라인', '품질검사실'];
    
    const workOrder = order.workOrders?.[0];
    const estimatedTime = Math.floor(seededRandom(order.id + '-time', 240, 600));
    const actualTime = order.status === '완료' || order.status === '진행중' ? 
      Math.floor(estimatedTime * seededRandom(order.id + '-actual', 0.8, 1.2)) : undefined;
    
    return {
      id: order.id,
      instructionNumber: `WI-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
      productName: order.productName,
      productCode: order.productCode,
      bomId: `BOM-${order.productCode}`,
      quantity: order.quantity,
      unit: "EA",
      priority: priorityMap[order.priority] || 'normal',
      status: statusMap[order.status] || 'pending',
      assignedWorker: workOrder?.assignedWorker || workers[Math.floor(seededRandom(order.id + '-worker', 0, workers.length))],
      workStation: workStations[Math.floor(seededRandom(order.id + '-station', 0, workStations.length))],
      estimatedTime,
      actualTime,
      startDate: order.plannedStartDate,
      dueDate: order.plannedEndDate,
      completedDate: order.status === '완료' ? order.actualEndDate : undefined,
      instructions: workOrder?.instructions || `1. ${order.productName} 부품 준비\n2. 조립 작업 수행\n3. 품질 검사 실시\n4. 최종 테스트 완료`,
      notes: order.status === '지연' ? '일정 지연으로 인한 조정 필요' : undefined,
      qualityCheck: seededRandom(order.id + '-quality', 0, 1) > 0.2,
      materials: [
        { 
          name: `${order.productName} 메인 부품`, 
          quantity: order.quantity, 
          unit: "EA", 
          available: Math.floor(order.quantity * seededRandom(order.id + '-mat1', 0.8, 1.0)) 
        },
        { 
          name: "조립 부품", 
          quantity: order.quantity * 2, 
          unit: "EA", 
          available: Math.floor(order.quantity * 2 * seededRandom(order.id + '-mat2', 0.9, 1.0)) 
        },
        { 
          name: "포장재", 
          quantity: order.quantity, 
          unit: "EA", 
          available: Math.floor(order.quantity * seededRandom(order.id + '-mat3', 0.95, 1.0)) 
        }
      ],
      customerName: customer?.companyName,
      orderAmount: salesOrder?.totalAmount
    };
  });
};

export function WorkInstructionProvider({ children }: { children: ReactNode }) {
  const { customers } = useCustomers();
  const [workInstructions, setWorkInstructions] = useState<WorkInstruction[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize work instructions from production orders only once
  useEffect(() => {
    if (!isInitialized && customers.length > 0) {
      const dynamicERPData = generateDynamicERPData(customers);
      const initialInstructions = generateWorkInstructionsFromERPData(dynamicERPData);
      setWorkInstructions(initialInstructions);
      setIsInitialized(true);
    }
  }, [customers, isInitialized]);

  const addWorkInstruction = (instruction: Omit<WorkInstruction, 'id' | 'instructionNumber'>) => {
    const newId = `wi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newInstructionNumber = `WI-${new Date().getFullYear()}-${String(workInstructions.length + 1).padStart(3, '0')}`;
    
    const newInstruction: WorkInstruction = {
      ...instruction,
      id: newId,
      instructionNumber: newInstructionNumber,
    };
    
    setWorkInstructions(prev => [...prev, newInstruction]);
  };

  const updateWorkInstruction = (id: string, updates: Partial<WorkInstruction>) => {
    setWorkInstructions(prev => 
      prev.map(instruction => 
        instruction.id === id ? { ...instruction, ...updates } : instruction
      )
    );
  };

  const deleteWorkInstruction = (id: string) => {
    setWorkInstructions(prev => prev.filter(instruction => instruction.id !== id));
  };

  const getWorkInstructionById = (id: string) => {
    return workInstructions.find(instruction => instruction.id === id);
  };

  const value: WorkInstructionContextType = {
    workInstructions,
    addWorkInstruction,
    updateWorkInstruction,
    deleteWorkInstruction,
    getWorkInstructionById,
  };

  return (
    <WorkInstructionContext.Provider value={value}>
      {children}
    </WorkInstructionContext.Provider>
  );
}

export function useWorkInstructions() {
  const context = useContext(WorkInstructionContext);
  if (context === undefined) {
    throw new Error('useWorkInstructions must be used within a WorkInstructionProvider');
  }
  return context;
}
