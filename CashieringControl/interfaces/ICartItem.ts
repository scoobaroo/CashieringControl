export interface ICartItem {
    bjac_imageurl: string;
    bjac_cartitemId: string;
    bjac_cartId: string;
    bjac_ship: boolean;
    bjac_drive: boolean;
    bjac_commission: number;
    bjac_isinvoiced: boolean;
    bjac_total: number;
    bjac_transactiontypeFormattedValue: string;
    bjac_transactiontype: number;
    bjac_comments: string;
    bjac_name: string;
    bjac_documentationfee: number;
    bjac_documentationfeeFormattedValue: string;
    bjac_vehicleName: string;
    bjac_vehicleId: string;
    bjac_stageFormattedValue: string;
    bjac_stage: number;
    bjac_hammerprice: number;
    bjac_totalamount: number;
}