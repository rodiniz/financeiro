import {Injectable} from "@angular/core";
import {CrudSqlService} from "./crud-sql.service";
import {Income} from "../models/income";

@Injectable({
    providedIn: "root",
})
export class IncomeService extends CrudSqlService<Income> {
    constructor() {
        super();
        this.documentName = "income";
    }
    async DeleteAll() {
        await this.loadDb();
        await this.db.execute(`DELETE FROM ${this.documentName}`);
    }
    async Exists(income: Income) {
        await this.loadDb();    

        let sql = ` SELECT *
                    FROM ${this.documentName}
                    where userid = $1
                      and amount = $2
                      and date =$3                    
        `;
        
        const response = await this.db.select<Income[]>(sql, [
            income.userId,
            income.amount,
            income.date,
        ]);
        return response.length > 0;
    }
}
