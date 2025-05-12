import React from 'react';
import './LockerLayout.css';

interface LockerProps {
  id: string;
  size: 'sizeA' | 'sizeB' | 'sizeC';
  status: 'lockerEmpty' | 'lockerInUse' | 'lockerOther';
  package?: string;
  name?: string;
  type?: 'serviceBox' | 'controllerBox';
}

interface ColumnProps {
  name: string;
  lockers: LockerProps[];
}

interface ModuleProps {
  columns: ColumnProps[];
}

const Locker: React.FC<LockerProps> = ({ id, size, status, package: packageId, name, type }) => {
  const isService = type === 'serviceBox';
  const isController = type === 'controllerBox';
  
  return (
    <div className="BMLayoutSlot BMLayoutSlotStandard">
      <div className={`BMLayoutLocker tooltip ${size} ${status} ${type ? `locker${type}` : ''} outer`} id={id}>
        <div className="middle">
          <div className="inner">
            {isService && 'Service'}
            {isController && 'Steering'}
            {packageId && (
              <img 
                className="BMLayoutParcel multiParcel tooltip hasParcel"
                src={packageId.includes(';') ? "/images/package_many.svg" : "/images/package_one.svg"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Column: React.FC<ColumnProps> = ({ name, lockers }) => {
  return (
    <div className="BMLayoutColumn">
      <div className="BMLayoutColumnName">{name}</div>
      {lockers.map((locker) => (
        <Locker key={locker.id} {...locker} />
      ))}
    </div>
  );
};

const Module: React.FC<ModuleProps> = ({ columns }) => {
  return (
    <div className="BMLayoutModule">
      {columns.map((column, index) => (
        <Column key={index} {...column} />
      ))}
    </div>
  );
};

const LockerLayout: React.FC = () => {
  return (
    <div className="BMLayoutNoScroll" style={{ width: '1209px' }}>
      <div className="BMLayoutSide">
        <Module columns={leftColumns} />
      </div>
      <div className="BMLayoutSide">
        <Module columns={centerColumns} />
      </div>
      <div className="BMLayoutSide">
        <Module columns={rightColumns} />
      </div>
    </div>
  );
};

// Data structure for the layout
const leftColumns = [
  {
    name: '4L',
    lockers: [
      { id: '4L1', size: 'sizeC' as const, status: 'lockerEmpty' as const },
      { id: '4L2', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '630727868500403024915818', name: '4L2' },
      { id: '4L3', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '605806078554234122009342', name: '4L3' },
      { id: '4L4', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '632700578554234031772915', name: '4L4' },
      { id: '4L5', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '602677178554234026184945;602677278554234021684045', name: '4L5' },
      { id: '4L6', size: 'sizeB' as const, status: 'lockerEmpty' as const },
      { id: '4L7', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '666002278554234128656950;692402278554234010752550', name: '4L7' }
    ]
  },
  {
    name: '3L',
    lockers: [
      { id: '3L1', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '626804178554234038206442', name: '3L1' },
      { id: '3L2', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '602677178554234010079218', name: '3L2' },
      { id: '3L3', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '652449860054234061786236', name: '3L3' },
      { id: '3L4', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '685636178554234023885073', name: '3L4' },
      { id: '3L5', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '652206930054234028857652', name: '3L5' },
      { id: '3L6', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '632050178554234025658535', name: '3L6' },
      { id: '3L7', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '605850178554234024930756;605850178554234027547358', name: '3L7' }
    ]
  },
  {
    name: '2L',
    lockers: [
      { id: '2L1', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '696320478554234015513648', name: '2L1' },
      { id: '2L2', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '653567950054234315818697', name: '2L2' },
      { id: '2L3', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '661872178554234114654283', name: '2L3' },
      { id: '2L4', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '653567950054234315949914;696320378554234012059124', name: '2L4' },
      { id: '2L5', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '654852080054234082433298', name: '2L5' },
      { id: '2L6', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '653567950054234315636065', name: '2L6' },
      { id: '2L7', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '602677178554234021655219', name: '2L7' },
      { id: '2L8', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '602677278554234029411937', name: '2L8' },
      { id: '2L9', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '653494850054234038895709', name: '2L9' },
      { id: '2L10', size: 'sizeA' as const, status: 'lockerEmpty' as const },
      { id: '2L11', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '696320778554234016911402', name: '2L11' },
      { id: '2L12', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '520000012354203052786569', name: '2L12' }
    ]
  },
  {
    name: '1L',
    lockers: [
      { id: '1L1', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '696320678554234012941915', name: '1L1' },
      { id: '1L2', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '602677278554234028192196', name: '1L2' },
      { id: '1L3', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '643382478554234017801121', name: '1L3' },
      { id: '1L4', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '605870178554234016115809', name: '1L4' },
      { id: '1L5', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '523000012354232052791180', name: '1L5' },
      { id: '1L6', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '671064178554234118322910', name: '1L6' },
      { id: '1L7', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '653999410054234110916301', name: '1L7' },
      { id: '1L8', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '630727178554234018641550', name: '1L8' },
      { id: '1L9', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '642125178554234018303830', name: '1L9' },
      { id: '1L10', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '696320378554234018588614', name: '1L10' },
      { id: '1L11', size: 'sizeA' as const, status: 'lockerEmpty' as const },
      { id: '1L12', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '603236278554234138689078;605074278554234016071339', name: '1L12' }
    ]
  }
];

const centerColumns = [
  {
    name: '',
    lockers: [
      { id: '0C1', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '659700178554234132668898', name: '0C1' },
      { id: '0C2', size: 'sizeB' as const, status: 'lockerOther' as const, type: 'serviceBox' as const },
      { id: '0C3', size: 'sizeC' as const, status: 'lockerOther' as const, type: 'controllerBox' as const },
      { id: '0C4', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '683000178554234019755557', name: '0C4' },
      { id: '0C5', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '605825968554234110887291', name: '0C5' },
      { id: '0C6', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '601510278554234017113658', name: '0C6' },
      { id: '0C7', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '696320978554234018914399', name: '0C7' },
      { id: '0C8', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '696320678554234019489549;696320678554234011096069', name: '0C8' }
    ]
  }
];

const rightColumns = [
  {
    name: '1R',
    lockers: [
      { id: '1R1', size: 'sizeC' as const, status: 'lockerEmpty' as const },
      { id: '1R2', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '696320478554234019095815', name: '1R2' },
      { id: '1R3', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '602677278554234013803680', name: '1R3' },
      { id: '1R4', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '632700578554234036474072', name: '1R4' },
      { id: '1R5', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '603228578554234027143363', name: '1R5' },
      { id: '1R6', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '632700578554234031088744', name: '1R6' },
      { id: '1R7', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '663640078554234012542505', name: '1R7' },
      { id: '1R8', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '602677178554234020698609', name: '1R8' },
      { id: '1R9', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '696320378554234017703321', name: '1R9' },
      { id: '1R10', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '699120278554234019574843', name: '1R10' },
      { id: '1R11', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '696320478554234014053775', name: '1R11' },
      { id: '1R12', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '696320378554234019101783', name: '1R12' }
    ]
  },
  {
    name: '2R',
    lockers: [
      { id: '2R1', size: 'sizeC' as const, status: 'lockerEmpty' as const },
      { id: '2R2', size: 'sizeB' as const, status: 'lockerEmpty' as const },
      { id: '2R3', size: 'sizeB' as const, status: 'lockerEmpty' as const },
      { id: '2R4', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '602692278554234013714992', name: '2R4' },
      { id: '2R5', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '614400278554234022813729', name: '2R5' },
      { id: '2R6', size: 'sizeB' as const, status: 'lockerEmpty' as const },
      { id: '2R7', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '642512278554234034106805', name: '2R7' }
    ]
  },
  {
    name: '3R',
    lockers: [
      { id: '3R1', size: 'sizeC' as const, status: 'lockerEmpty' as const },
      { id: '3R2', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '641819178554234026462595', name: '3R2' },
      { id: '3R3', size: 'sizeB' as const, status: 'lockerEmpty' as const },
      { id: '3R4', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '660166178554234139826596', name: '3R4' },
      { id: '3R5', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '666002078554234129187737', name: '3R5' },
      { id: '3R6', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '642512178554234026871082', name: '3R6' },
      { id: '3R7', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '632002178554234027025696;630727278554234041913355', name: '3R7' }
    ]
  },
  {
    name: '4R',
    lockers: [
      { id: '4R1', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '696320478554234013401693', name: '4R1' },
      { id: '4R2', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '654852080054234082528972', name: '4R2' },
      { id: '4R3', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '695080078554234026628530', name: '4R3' },
      { id: '4R4', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '655020178554234014975808', name: '4R4' },
      { id: '4R5', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '602677178554234026132392', name: '4R5' },
      { id: '4R6', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '602677278554234013550200', name: '4R6' },
      { id: '4R7', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '603840078554234126442508', name: '4R7' },
      { id: '4R8', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '654751570054234174944493', name: '4R8' },
      { id: '4R9', size: 'sizeA' as const, status: 'lockerInUse' as const, package: '605850178554234010455733', name: '4R9' },
      { id: '4R10', size: 'sizeB' as const, status: 'lockerEmpty' as const },
      { id: '4R11', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '602677178554234032477237', name: '4R11' }
    ]
  },
  {
    name: '5R',
    lockers: [
      { id: '5R1', size: 'sizeC' as const, status: 'lockerEmpty' as const },
      { id: '5R2', size: 'sizeB' as const, status: 'lockerEmpty' as const },
      { id: '5R3', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '661872378554234130353065', name: '5R3' },
      { id: '5R4', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '696320378554234014846851', name: '5R4' },
      { id: '5R5', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '631752178554234121542044', name: '5R5' },
      { id: '5R6', size: 'sizeB' as const, status: 'lockerInUse' as const, package: '639200178554234020510143', name: '5R6' },
      { id: '5R7', size: 'sizeC' as const, status: 'lockerInUse' as const, package: '520000012354234052530515', name: '5R7' }
    ]
  }
];

export default LockerLayout; 